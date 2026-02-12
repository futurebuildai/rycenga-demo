/**
 * Admin Messaging Service
 * Provides messaging functionality via the Bird integration.
 *
 * Backend API: /v1/communications/messages
 * - POST: Send SMS or email
 * - GET: List messages with filters
 *
 * Virtual Threads: Messages are grouped by phone number client-side
 * to create a conversation view. The backend stores flat messages.
 */

import { adminClient } from './admin-client.js';
import type {
    Thread,
    Message,
    Agent,
    ThreadTab,
    ThreadListResponse,
    MessageListResponse,
    SendMessagePayload,
    AssignAgentsPayload,
    AssignedAgent,
    BackendCommunicationMessage,
    BackendMessagesResponse,
    BackendSendMessageRequest,
} from './messaging-types.js';
import {
    groupMessagesIntoThreads,
    mapBackendMessage,
    getMessageContactPhone,
    isTextContent,
} from './messaging-types.js';

// === Helper Functions ===

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// === Service Implementation ===

class AdminMessagingServiceImpl {
    // Cache for all messages to build virtual threads
    private messageCache: BackendCommunicationMessage[] = [];
    private lastFetchTime = 0;
    private readonly CACHE_TTL_MS = 30000; // 30 seconds

    /**
     * Fetch all messages from backend and cache them.
     * Used to build virtual threads client-side.
     */
    private async fetchAllMessages(forceRefresh = false): Promise<BackendCommunicationMessage[]> {
        const now = Date.now();
        if (!forceRefresh && this.messageCache.length > 0 && (now - this.lastFetchTime) < this.CACHE_TTL_MS) {
            return this.messageCache;
        }

        try {
            // Fetch recent messages (both inbound and outbound)
            const response = await adminClient.request<BackendMessagesResponse>(
                '/v1/communications/messages?limit=500&offset=0'
            );
            this.messageCache = response.items || [];
            this.lastFetchTime = now;
            return this.messageCache;
        } catch (e) {
            console.error('Failed to fetch messages:', e);
            return this.messageCache; // Return stale cache on error
        }
    }

    /**
     * Get conversation threads (virtual - grouped by phone number).
     * The 'tab' filter is not yet supported by backend.
     */
    async getThreads(
        tab: ThreadTab = 'all-threads',
        limit = 25,
        offset = 0,
        search = ''
    ): Promise<ThreadListResponse> {
        const messages = await this.fetchAllMessages();
        let threads = groupMessagesIntoThreads(messages);

        // Apply search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            threads = threads.filter(t =>
                t.contact.phone.includes(search) ||
                t.contact.name.toLowerCase().includes(searchLower)
            );
        }

        // Note: 'my-threads' filter would require agent assignment tracking
        // which is not yet implemented in backend

        const total = threads.length;
        const paginatedThreads = threads.slice(offset, offset + limit);

        return {
            items: paginatedThreads,
            total,
            hasMore: offset + limit < total,
        };
    }

    /**
     * Get messages for a thread (phone number).
     * threadId is the phone number used to group messages.
     */
    async getMessages(
        threadId: string,
        limit = 50,
        before?: string
    ): Promise<MessageListResponse> {
        const allMessages = await this.fetchAllMessages();

        // Filter messages for this thread (phone number)
        let threadMessages = allMessages.filter(msg => {
            const contactPhone = getMessageContactPhone(msg);
            return contactPhone === threadId;
        });

        // Sort by createdAt ascending (oldest first for chat view)
        threadMessages.sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Apply 'before' pagination
        if (before) {
            const beforeTime = new Date(before).getTime();
            threadMessages = threadMessages.filter(msg =>
                new Date(msg.createdAt).getTime() < beforeTime
            );
        }

        const total = threadMessages.length;
        const limitedMessages = threadMessages.slice(-limit); // Take last N messages

        return {
            items: limitedMessages.map(msg => mapBackendMessage(msg, threadId)),
            total,
            hasMore: threadMessages.length > limit,
        };
    }

    /**
     * Send a message via Bird.
     * Backend endpoint: POST /v1/communications/messages
     */
    async sendMessage(payload: SendMessagePayload): Promise<Message> {
        const { threadId, content } = payload;

        // Extract message text
        let messageText = '';
        if (isTextContent(content)) {
            messageText = content.text;
        } else {
            throw new Error('Only text messages are currently supported');
        }

        // threadId is the phone number
        const request: BackendSendMessageRequest = {
            channel: 'sms',
            to: threadId,
            message: messageText,
        };

        const response = await adminClient.request<BackendCommunicationMessage>(
            '/v1/communications/messages',
            {
                method: 'POST',
                body: JSON.stringify(request),
            }
        );

        // Invalidate cache to pick up the new message
        this.lastFetchTime = 0;

        return mapBackendMessage(response, threadId);
    }

    /**
     * Start a new conversation by sending the first message.
     * Creates a "virtual thread" by sending to a new phone number.
     */
    async startConversation(
        phone: string,
        message: string,
        channel: 'sms' | 'email' = 'sms',
        subject?: string
    ): Promise<{ thread: Thread; message: Message }> {
        const request: BackendSendMessageRequest = {
            channel,
            to: phone,
            message,
            subject: channel === 'email' ? subject : undefined,
        };

        const response = await adminClient.request<BackendCommunicationMessage>(
            '/v1/communications/messages',
            {
                method: 'POST',
                body: JSON.stringify(request),
            }
        );

        // Invalidate cache
        this.lastFetchTime = 0;

        const mappedMessage = mapBackendMessage(response, phone);

        // Create virtual thread
        const thread: Thread = {
            id: phone,
            contact: {
                id: phone,
                name: phone,
                phone: phone,
                accountId: response.accountId,
            },
            lastMessage: mappedMessage,
            unreadCount: 0,
            status: 'open',
            assignedAgents: [],
            channel: channel as 'sms' | 'email',
            createdAt: response.createdAt,
            updatedAt: response.createdAt,
        };

        return { thread, message: mappedMessage };
    }

    /**
     * Get available agents for assignment.
     * NOTE: Agent assignment is not yet supported by backend.
     * Returns empty array until backend implements this feature.
     */
    async getAgents(): Promise<Agent[]> {
        // Backend does not yet support agent management for messaging
        // This would need a new endpoint: GET /v1/communications/agents
        console.warn('Agent assignment not yet supported by backend');
        return [];
    }

    /**
     * Assign agents to a thread.
     * NOTE: Not yet supported by backend.
     */
    async assignAgents(payload: AssignAgentsPayload): Promise<AssignedAgent[]> {
        // Backend does not yet support agent assignment
        // This would need: PUT /v1/communications/threads/{id}/assign
        console.warn('Agent assignment not yet supported by backend');
        return [];
    }

    /**
     * Mark a thread as read.
     * NOTE: Not yet supported by backend.
     */
    async markThreadRead(threadId: string): Promise<void> {
        // Backend does not yet track read status
        // This would need: PUT /v1/communications/threads/{id}/read
        console.warn('Read status tracking not yet supported by backend');
    }

    /**
     * Refresh the message cache.
     * Call this after sending a message or to get latest inbound messages.
     */
    async refresh(): Promise<void> {
        await this.fetchAllMessages(true);
    }

    /**
     * Format a timestamp as relative time (e.g., "2m ago", "Yesterday").
     */
    getRelativeTime(dateStr: string): string {
        return formatRelativeTime(dateStr);
    }
}

export const AdminMessagingService = new AdminMessagingServiceImpl();
