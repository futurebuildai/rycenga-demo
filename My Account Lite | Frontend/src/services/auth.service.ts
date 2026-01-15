/**
 * AuthService - Singleton for authentication state management
 * Handles login/logout with demo credentials and localStorage session
 */

import type { Session } from '../types/index.js';

const STORAGE_KEY = 'lumberboss_session';
const DEMO_EMAIL = 'HomeProUSA@demo.com';
const DEMO_PASSWORD = 'MyAccountLite2026';

class AuthServiceImpl {
    private listeners: Set<(isAuthenticated: boolean) => void> = new Set();

    /**
     * Attempt login with provided credentials
     * @returns true if credentials match demo account
     */
    login(email: string, password: string): boolean {
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
            const session: Session = {
                email,
                loginTime: new Date().toISOString(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
            this.notifyListeners(true);
            return true;
        }
        return false;
    }

    /**
     * Clear session and log out
     */
    logout(): void {
        localStorage.removeItem(STORAGE_KEY);
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
     * Subscribe to authentication state changes
     */
    subscribe(listener: (isAuthenticated: boolean) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(isAuthenticated: boolean): void {
        this.listeners.forEach(listener => listener(isAuthenticated));
    }
}

// Singleton export
export const AuthService = new AuthServiceImpl();
