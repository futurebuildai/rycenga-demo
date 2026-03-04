import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AdminMessagingService } from '../services/admin-messaging.service.js';
import type { Thread, Message, ThreadTab } from '../services/messaging-types.js';

// Import components
import '../components/messaging/thread-list.js';
import '../components/messaging/chat-window.js';
import '../components/messaging/new-thread-modal.js';
import { pageMessagingStyles } from '../../styles/admin-messaging.js';

@customElement('admin-page-messaging')
export class PageMessaging extends LitElement {
    static styles = pageMessagingStyles;

    @state() private threads: Thread[] = [];
    @state() private selectedThread: Thread | null = null;
    @state() private messages: Message[] = [];
    @state() private currentTab: ThreadTab = 'all-threads';
    @state() private searchQuery = '';
    @state() private loadingThreads = true;
    @state() private loadingMessages = false;
    @state() private showNewThreadModal = false;

    async connectedCallback() {
        super.connectedCallback();
        await this.loadThreads();
        this.handleDeepLinkParams();
    }

    private handleDeepLinkParams() {
        const params = new URLSearchParams(window.location.search);
        const phone = params.get('phone');
        if (!phone) return;

        const contactName = params.get('contactName') || phone;
        const accountId = params.get('accountId');
        const accountName = params.get('accountName');

        // Clean URL to prevent re-trigger on refresh
        window.history.replaceState({}, '', window.location.pathname);

        // Look for an existing thread matching this phone number
        const existing = this.threads.find(t => t.contact.phone === phone);
        if (existing) {
            this.selectedThread = existing;
            this.loadMessages(existing.id);
            return;
        }

        // Create a local placeholder thread (same pattern as handleNewThreadCreate)
        const newThread: Thread = {
            id: phone,
            contact: {
                id: phone,
                name: contactName,
                phone: phone,
                accountId: accountId ? Number(accountId) : undefined,
                accountName: accountName || undefined,
            },
            lastMessage: null,
            unreadCount: 0,
            status: 'open',
            assignedAgents: [],
            channel: 'sms',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.threads = [newThread, ...this.threads];
        this.selectedThread = newThread;
        this.messages = [];
    }

    private async loadThreads() {
        this.loadingThreads = true;
        try {
            const response = await AdminMessagingService.getThreads(
                this.currentTab,
                25,
                0,
                this.searchQuery
            );
            this.threads = response.items;
        } catch (e) {
            console.error('Failed to load threads:', e);
        } finally {
            this.loadingThreads = false;
        }
    }

    private async loadMessages(threadId: string) {
        this.loadingMessages = true;
        try {
            const response = await AdminMessagingService.getMessages(threadId);
            this.messages = response.items;
            await AdminMessagingService.markThreadRead(threadId);

            // Update thread in list to reflect read status
            this.threads = this.threads.map((t) =>
                t.id === threadId ? { ...t, unreadCount: 0 } : t
            );
        } catch (e) {
            console.error('Failed to load messages:', e);
        } finally {
            this.loadingMessages = false;
        }
    }

    private async handleThreadSelect(e: CustomEvent<{ threadId: string }>) {
        const thread = this.threads.find((t) => t.id === e.detail.threadId);
        if (!thread) return;

        this.selectedThread = thread;
        await this.loadMessages(thread.id);
    }

    private async handleTabChange(e: CustomEvent<{ tab: ThreadTab }>) {
        this.currentTab = e.detail.tab;
        this.selectedThread = null;
        this.messages = [];
        await this.loadThreads();
    }

    private async handleSearch(e: CustomEvent<{ query: string }>) {
        this.searchQuery = e.detail.query;
        await this.loadThreads();
    }

    private async handleSendMessage(e: CustomEvent<{ text: string }>) {
        if (!this.selectedThread) return;
        const currentThread = this.selectedThread;

        try {
            const message = await AdminMessagingService.sendMessage({
                threadId: currentThread.id,
                recipient: currentThread.contact.phone,
                accountId: currentThread.contact.accountId,
                type: 'text',
                content: { text: e.detail.text },
            });

            this.messages = [...this.messages, message];
            const nextThreadId = message.threadId;

            // Update thread in list with new lastMessage
            this.threads = this.threads.map((t) =>
                t.id === currentThread.id
                    ? { ...t, id: nextThreadId, lastMessage: message, updatedAt: message.createdAt }
                    : t
            );
            if (this.selectedThread?.id === currentThread.id) {
                this.selectedThread = {
                    ...currentThread,
                    id: nextThreadId,
                    lastMessage: message,
                    updatedAt: message.createdAt,
                };
            }

            // Re-sort threads (most recent first)
            this.threads = [...this.threads].sort(
                (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
        } catch (e) {
            console.error('Failed to send message:', e);
        }
    }

    private async handleAttachFile(e: CustomEvent<{ file: File }>) {
        if (!this.selectedThread) return;
        const currentThread = this.selectedThread;

        const file = e.detail.file;

        // Create a mock "uploading" message
        const uploadingMessage: Message = {
            id: `uploading-${Date.now()}`,
            threadId: this.selectedThread.id,
            direction: 'outbound',
            type: 'file',
            content: {
                mediaUrl: '',
                mimeType: file.type,
                fileName: file.name,
                fileSize: file.size,
            },
            createdAt: new Date().toISOString(),
            status: 'sending',
            senderName: 'Current User',
        };

        this.messages = [...this.messages, uploadingMessage];

        // Simulate upload completion after delay
        setTimeout(async () => {
            try {
                const message = await AdminMessagingService.sendMessage({
                    threadId: currentThread.id,
                    recipient: currentThread.contact.phone,
                    accountId: currentThread.contact.accountId,
                    type: 'file',
                    content: {
                        mediaUrl: `/uploads/${file.name}`,
                        mimeType: file.type,
                        fileName: file.name,
                        fileSize: file.size,
                    },
                });

                // Replace uploading message with sent message
                this.messages = this.messages.map((m) =>
                    m.id === uploadingMessage.id ? message : m
                );

                // Update thread
                this.threads = this.threads.map((t) =>
                    t.id === currentThread.id
                        ? { ...t, id: message.threadId, lastMessage: message, updatedAt: message.createdAt }
                        : t
                );
                if (this.selectedThread?.id === currentThread.id) {
                    this.selectedThread = {
                        ...currentThread,
                        id: message.threadId,
                        lastMessage: message,
                        updatedAt: message.createdAt,
                    };
                }
            } catch (err) {
                console.error('Failed to upload file:', err);
                // Remove uploading message on failure
                this.messages = this.messages.filter((m) => m.id !== uploadingMessage.id);
            }
        }, 1500);
    }

    private async handleAssignAgents(e: CustomEvent<{ agentIds: number[] }>) {
        if (!this.selectedThread) return;

        try {
            const assignedAgents = await AdminMessagingService.assignAgents({
                threadId: this.selectedThread.id,
                agentIds: e.detail.agentIds,
            });

            // Update selected thread
            this.selectedThread = { ...this.selectedThread, assignedAgents };

            // Update thread in list
            this.threads = this.threads.map((t) =>
                t.id === this.selectedThread!.id
                    ? { ...t, assignedAgents }
                    : t
            );
        } catch (e) {
            console.error('Failed to assign agents:', e);
        }
    }

    private handleNewThread() {
        this.showNewThreadModal = true;
    }

    private handleNewThreadClose() {
        this.showNewThreadModal = false;
    }

    private async handleNewThreadCreate(e: CustomEvent<{
        contactName: string;
        contactPhone: string;
        initialMessage: string;
        accountId?: number;
        accountName?: string;
        userId?: number;
    }>) {
        const { contactName, contactPhone, initialMessage, accountId, accountName } = e.detail;

        // Close modal first
        this.showNewThreadModal = false;

        // If no initial message, just create a local placeholder thread
        if (!initialMessage.trim()) {
            const newThread: Thread = {
                id: contactPhone, // Temporary key until first backend message returns conversationId
                contact: {
                    id: contactPhone,
                    name: contactName || contactPhone,
                    phone: contactPhone,
                    accountId: accountId,
                    accountName: accountName,
                },
                lastMessage: null,
                unreadCount: 0,
                status: 'open',
                assignedAgents: [],
                channel: 'sms',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            this.threads = [newThread, ...this.threads];
            this.selectedThread = newThread;
            this.messages = [];
            return;
        }

        // Start a new conversation via Bird API
        try {
            const { thread, message } = await AdminMessagingService.startConversation(
                contactPhone,
                initialMessage,
                'sms',
                undefined,
                accountId
            );

            // Enhance thread contact with provided name
            thread.contact.name = contactName || contactPhone;
            thread.contact.accountId = accountId;
            thread.contact.accountName = accountName;

            // Add to threads list and select it
            this.threads = [thread, ...this.threads];
            this.selectedThread = thread;
            this.messages = [message];
        } catch (err) {
            console.error('Failed to start conversation:', err);
            // Create local thread anyway so user can retry
            const newThread: Thread = {
                id: contactPhone,
                contact: {
                    id: contactPhone,
                    name: contactName || contactPhone,
                    phone: contactPhone,
                    accountId: accountId,
                    accountName: accountName,
                },
                lastMessage: null,
                unreadCount: 0,
                status: 'open',
                assignedAgents: [],
                channel: 'sms',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            this.threads = [newThread, ...this.threads];
            this.selectedThread = newThread;
            this.messages = [];
        }
    }

    render() {
        return html`
            <div class="messaging-container">
                <messaging-thread-list
                    .threads=${this.threads}
                    .selectedId=${this.selectedThread?.id ?? null}
                    .loading=${this.loadingThreads}
                    @thread-select=${this.handleThreadSelect}
                    @tab-change=${this.handleTabChange}
                    @search=${this.handleSearch}
                    @new-thread=${this.handleNewThread}
                ></messaging-thread-list>

                ${this.selectedThread
                ? html`
                        <messaging-chat-window
                            .thread=${this.selectedThread}
                            .messages=${this.messages}
                            .loading=${this.loadingMessages}
                            @send-message=${this.handleSendMessage}
                            @attach-file=${this.handleAttachFile}
                            @assign-agents=${this.handleAssignAgents}
                        ></messaging-chat-window>
                    `
                : html`
                        <div class="empty-state">
                            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <h3 class="empty-title">Select a conversation</h3>
                            <p class="empty-description">Choose a thread from the list to start messaging</p>
                        </div>
                    `
            }
            </div>

            <messaging-new-thread-modal
                .open=${this.showNewThreadModal}
                @close=${this.handleNewThreadClose}
                @create=${this.handleNewThreadCreate}
            ></messaging-new-thread-modal>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'admin-page-messaging': PageMessaging;
    }
}
