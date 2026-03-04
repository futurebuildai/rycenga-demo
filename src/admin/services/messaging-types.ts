/**
 * Messaging Types
 * Data contracts for the Messaging Center feature.
 * Aligned with backend /v1/communications API.
 */

// === Enums & Literals ===

export type MessageDirection = 'inbound' | 'outbound';
export type MessageType = 'text' | 'image' | 'file';
export type ThreadStatus = 'open' | 'assigned' | 'resolved';
export type ThreadTab = 'my-threads' | 'all-threads';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type ChannelType = 'sms' | 'whatsapp' | 'email';

// === Backend API Types (matches Go backend) ===

/**
 * Backend CommunicationMessage from /v1/communications/messages
 */
export interface BackendCommunicationMessage {
    id: number;
    accountId?: number;
    conversationId?: number;
    direction: 'inbound' | 'outbound';
    channel: string;
    provider: string;
    providerMessageId?: string;
    providerChannelId?: string;
    providerWorkspaceId?: string;
    reference?: string;
    status?: string;
    originator?: string;
    recipient?: string;
    body?: string;
    payload?: unknown;
    createdAt: string;
}

export interface BackendMessagesResponse {
    items: BackendCommunicationMessage[];
    total: number;
}

export interface BackendSendMessageRequest {
    channel: 'sms' | 'email';
    to: string;
    accountId?: number;
    subject?: string;
    message: string;
    reference?: string;
    replyTo?: string;
}

// === Contact ===

export interface MessagingContact {
    id: string;
    name: string;
    phone: string;
    email?: string;
    accountId?: number;
    accountName?: string;
    avatarUrl?: string;
}

// === Message Content ===

export interface TextContent {
    text: string;
}

export interface MediaContent {
    mediaUrl: string;
    mimeType: string;
    fileName?: string;
    fileSize?: number;
    thumbnailUrl?: string;
}

export type MessageContent = TextContent | MediaContent;

// === Message ===

export interface Message {
    id: string;
    threadId: string;
    direction: MessageDirection;
    type: MessageType;
    content: MessageContent;
    createdAt: string;
    status: MessageStatus;
    senderName?: string;
}

// === Assigned Agent (placeholder - not yet supported by backend) ===

export interface AssignedAgent {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string;
}

// === Thread (virtual - created client-side by grouping messages) ===

export interface Thread {
    id: string;
    contact: MessagingContact;
    lastMessage: Message | null;
    unreadCount: number;
    status: ThreadStatus;
    assignedAgents: AssignedAgent[];
    channel: ChannelType;
    createdAt: string;
    updatedAt: string;
}

// === Agent ===

export interface Agent {
    id: number;
    name: string;
    email: string;
    isAvailable: boolean;
    avatarUrl?: string;
}

// === API Response Types ===

export interface ThreadListResponse {
    items: Thread[];
    total: number;
    hasMore: boolean;
}

export interface MessageListResponse {
    items: Message[];
    total: number;
    hasMore: boolean;
}

// === Payload Types ===

export interface SendMessagePayload {
    threadId: string;
    recipient?: string;
    accountId?: number;
    type: MessageType;
    content: MessageContent;
}

export interface AssignAgentsPayload {
    threadId: string;
    agentIds: number[];
}

// === Type Guards ===

export function isTextContent(content: MessageContent): content is TextContent {
    return 'text' in content;
}

export function isMediaContent(content: MessageContent): content is MediaContent {
    return 'mediaUrl' in content;
}

function normalizeMessageDirection(direction?: string): MessageDirection {
    const value = (direction || '').toLowerCase();
    if (value === 'inbound' || value === 'received' || value === 'incoming') return 'inbound';
    if (value === 'outbound' || value === 'sent' || value === 'outgoing') return 'outbound';
    return 'outbound';
}

// === Mappers ===

/**
 * Map backend message status to frontend status
 */
function mapMessageStatus(backendStatus?: string): MessageStatus {
    if (!backendStatus) return 'sent';
    const status = backendStatus.toLowerCase();
    if (status === 'delivered') return 'delivered';
    if (status === 'read') return 'read';
    if (status === 'failed' || status === 'error') return 'failed';
    if (status === 'pending' || status === 'queued') return 'sending';
    return 'sent';
}

/**
 * Convert backend CommunicationMessage to frontend Message
 */
export function mapBackendMessage(msg: BackendCommunicationMessage, threadId: string): Message {
    const direction = normalizeMessageDirection(msg.direction);
    return {
        id: String(msg.id),
        threadId,
        direction,
        type: 'text',
        content: { text: msg.body || '' },
        createdAt: msg.createdAt,
        status: mapMessageStatus(msg.status),
        senderName: direction === 'inbound' ? msg.originator : undefined,
    };
}

/**
 * Get the phone number that represents the "other party" in a message.
 * For inbound: originator (who sent it)
 * For outbound: recipient (who we sent it to)
 */
export function getMessageContactPhone(msg: BackendCommunicationMessage): string {
    const direction = normalizeMessageDirection(msg.direction);
    return direction === 'inbound'
        ? (msg.originator || 'unknown')
        : (msg.recipient || 'unknown');
}

const conversationThreadPrefix = 'conversation:';

export function parseConversationThreadId(threadId: string): number | null {
    if (!threadId.startsWith(conversationThreadPrefix)) {
        return null;
    }
    const value = Number.parseInt(threadId.slice(conversationThreadPrefix.length), 10);
    return Number.isFinite(value) ? value : null;
}

export function getBackendThreadId(msg: BackendCommunicationMessage): string {
    if (typeof msg.conversationId === 'number' && Number.isFinite(msg.conversationId)) {
        return `${conversationThreadPrefix}${msg.conversationId}`;
    }
    const channel = (msg.channel || 'sms').toLowerCase();
    const contact = getMessageContactPhone(msg).trim().toLowerCase();
    return `fallback:${channel}:${contact}`;
}

/**
 * Group flat messages into virtual threads by backend conversation ID,
 * with channel/contact fallback when conversation IDs are missing.
 */
export function groupMessagesIntoThreads(messages: BackendCommunicationMessage[]): Thread[] {
    const threadMap = new Map<string, {
        messages: BackendCommunicationMessage[];
        latestMessage: BackendCommunicationMessage;
    }>();

    // Group by backend conversation ID when available; fallback to channel + contact.
    for (const msg of messages) {
        const threadId = getBackendThreadId(msg);
        const existing = threadMap.get(threadId);

        if (!existing) {
            threadMap.set(threadId, { messages: [msg], latestMessage: msg });
        } else {
            existing.messages.push(msg);
            // Update latest if this message is newer
            if (new Date(msg.createdAt) > new Date(existing.latestMessage.createdAt)) {
                existing.latestMessage = msg;
            }
        }
    }

    // Convert to Thread objects
    const threads: Thread[] = [];
    for (const [threadId, data] of threadMap) {
        const latest = data.latestMessage;
        const phone = getMessageContactPhone(latest);

        threads.push({
            id: threadId,
            contact: {
                id: phone,
                name: phone, // Will be enhanced with account lookup later
                phone: phone,
                accountId: latest.accountId,
            },
            lastMessage: mapBackendMessage(latest, threadId),
            unreadCount: 0, // Not tracked by backend yet
            status: 'open', // Not tracked by backend yet
            assignedAgents: [], // Not supported by backend yet
            channel: (latest.channel as ChannelType) || 'sms',
            createdAt: data.messages[data.messages.length - 1]?.createdAt || latest.createdAt,
            updatedAt: latest.createdAt,
        });
    }

    // Sort by most recent message
    threads.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return threads;
}
