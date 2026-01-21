/**
 * AuthService - Singleton for authentication state management
 * Handles login/logout using the Backend Integration Layer
 */

import { AuthService as ConnectorAuth } from '../connect/services/auth';
import type { User } from '../connect/types/domain';

// Keeping the Session interface for backward compatibility if used elsewhere, 
// but we might prefer using the User domain object.
// For now, let's map User to a Session-like structure if needed, or just store the User.
export interface Session {
    email: string;
    loginTime: string;
    user?: User;
}

const STORAGE_KEY = 'lumberboss_session';

class AuthServiceImpl {
    private listeners: Set<(isAuthenticated: boolean) => void> = new Set();
    private currentUser: User | null = null;

    private normalizeUser(user: Record<string, unknown>): User {
        const normalized = { ...user } as Record<string, any>;

        if (normalized.accountId == null && normalized.account_id != null) {
            normalized.accountId = normalized.account_id;
        }
        if (normalized.isActive == null && normalized.is_active != null) {
            normalized.isActive = normalized.is_active;
        }
        if (normalized.lastLoginAt == null && normalized.last_login_at != null) {
            normalized.lastLoginAt = normalized.last_login_at;
        }

        // Ensure id exists if passed as user_id
        if (normalized.id == null && normalized.user_id != null) {
            normalized.id = normalized.user_id;
        }

        return normalized as unknown as User;
    }

    /**
     * Attempt login with provided credentials
     * @returns true if login successful
     */
    async login(email: string, password: string): Promise<boolean> {
        try {
            const response = await ConnectorAuth.login(email, password);
            const user = this.normalizeUser(response.user as unknown as Record<string, unknown>);

            // Store session
            const session: Session = {
                email: user.email,
                loginTime: new Date().toISOString(),
                user
            };

            this.currentUser = user;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
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
            const session = JSON.parse(data) as Session;
            if (session.user) {
                session.user = this.normalizeUser(session.user as unknown as Record<string, unknown>);
            }
            return session;
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
        if (!session?.user) return null;
        const user = this.normalizeUser(session.user as unknown as Record<string, unknown>);
        this.currentUser = user;
        return user;
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
