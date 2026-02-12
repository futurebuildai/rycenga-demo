/**
 * AuthService - Singleton for authentication state management
 * Handles login/logout using the Backend Integration Layer
 */

import { AuthService as ConnectorAuth } from '../connect/services/auth';
import type { User } from '../connect/types/domain';
export interface Session {
    email: string;
    loginTime: string;
    user?: User;
}

const STORAGE_KEY = 'velocity_session';
const IMPERSONATION_KEY = 'impersonation_session';

class AuthServiceImpl {
    private listeners: Set<(isAuthenticated: boolean) => void> = new Set();
    private currentUser: User | null = null;

    constructor() {
        // Handle session expiration from API client
        import('../connect/client').then(({ client }) => {
            client.onUnauthorized = () => {
                console.warn('Session expired - performing auto-logout');
                import('../components/atoms/pv-toast').then(({ PvToast }) => {
                    PvToast.suppressErrors = true;
                    PvToast.show('Your session has expired. Please log in again.', 'warning');
                });
                this.logout();
            };
        });
    }

    /**
     * Attempt login with provided credentials
     * @returns success + optional reason on failure
     */
    async login(email: string, password: string): Promise<{ success: boolean; reason?: string; redirectTo?: string }> {
        try {
            const response = await ConnectorAuth.login(email, password);
            if (response.portal === 'admin' || response.requiresOtp) {
                const params = new URLSearchParams({ email });
                if (response.otpRequestId) {
                    params.set('otpRequestId', String(response.otpRequestId));
                }
                if (response.expiresAt) {
                    params.set('expiresAt', response.expiresAt);
                }
                return { success: false, redirectTo: `/admin?${params.toString()}` };
            }

            if (!response.user) {
                return { success: false, reason: 'Invalid login response.' };
            }


            // Reset error suppression on successful login
            import('../components/atoms/pv-toast').then(({ PvToast }) => {
                PvToast.suppressErrors = false;
            });

            // Store session
            const session: Session = {
                email: response.user.email,
                loginTime: new Date().toISOString(),
                user: response.user
            };

            this.currentUser = response.user;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
            localStorage.removeItem(IMPERSONATION_KEY);
            this.notifyListeners(true);
            return { success: true };
        } catch (error) {
            console.error("Login failed:", error);
            const message = error instanceof Error ? error.message : '';
            const cleaned = message.replace(/^API Error:\s*/i, '').trim();
            const fallback = cleaned || 'Invalid email or password.';
            if (/account locked/i.test(fallback)) {
                return { success: false, reason: 'Account locked due to too many failed attempts. Try again in 15 minutes.' };
            }
            return { success: false, reason: fallback };
        }
    }

    /**
     * Clear session and log out
     */
    logout(): void {
        ConnectorAuth.logout();
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(IMPERSONATION_KEY);
        this.currentUser = null;
        this.notifyListeners(false);
    }

    /**
     * Check if user has active session
     */
    isAuthenticated(): boolean {
        return this.getSession() !== null;
    }

    /**
     * Get current session data
     */
    getSession(): Session | null {
        if (!localStorage.getItem('auth_token')) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        let data = localStorage.getItem(STORAGE_KEY);
        if (!data) return null;

        try {
            return JSON.parse(data) as Session;
        } catch {
            return null;
        }
    }

    /**
     * Get current user
     */
    getUser(): User | null {
        if (this.currentUser) return this.currentUser;
        const session = this.getSession();
        return session?.user || null;
    }


    isPlatformAdminSession(): boolean {
        const claims = this.getTokenClaims();
        return !!claims?.is_platform_admin && !claims?.impersonator_user_id;
    }

    private getTokenClaims(): { is_platform_admin?: boolean; impersonator_user_id?: number } | null {
        const token = localStorage.getItem('auth_token');
        if (!token) return null;
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const payload = this.decodeBase64Url(parts[1]);
        if (!payload) return null;
        try {
            return JSON.parse(payload) as { is_platform_admin?: boolean; impersonator_user_id?: number };
        } catch {
            return null;
        }
    }

    private decodeBase64Url(input: string): string | null {
        const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
        try {
            return atob(padded);
        } catch {
            return null;
        }
    }

    /**
     * Subscribe to authentication state changes
     */
    subscribe(listener: (isAuthenticated: boolean) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(isAuthenticated: boolean): void {
        this.listeners.forEach(listener => listener(isAuthenticated));
        // Force reload to clear/reset UI state if needed, or rely on listeners
    }
}

// Singleton export
export const AuthService = new AuthServiceImpl();
