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

const STORAGE_KEY = 'lumberboss_session';
const IMPERSONATION_KEY = 'impersonation_session';

class AuthServiceImpl {
    private listeners: Set<(isAuthenticated: boolean) => void> = new Set();
    private currentUser: User | null = null;

    constructor() {
        // Handle session expiration from API client
        import('../connect/client').then(({ client }) => {
            client.onUnauthorized = () => {
                console.warn('Session expired - performing auto-logout');
                import('../components/atoms/lb-toast').then(({ LbToast }) => {
                    LbToast.suppressErrors = true;
                    LbToast.show('Your session has expired. Please log in again.', 'warning');
                });
                this.logout();
            };
        });
    }

    /**
     * Attempt login with provided credentials
     * @returns true if login successful
     */
    async login(email: string, password: string): Promise<boolean> {
        try {
            const response = await ConnectorAuth.login(email, password);

            // Reset error suppression on successful login
            import('../components/atoms/lb-toast').then(({ LbToast }) => {
                LbToast.suppressErrors = false;
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
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
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
        const data = localStorage.getItem(STORAGE_KEY);
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
