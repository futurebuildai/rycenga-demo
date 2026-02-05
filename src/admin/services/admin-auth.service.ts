/**
 * Admin Auth Service
 * Handles login/logout and session management for the Admin Portal.
 * Validates that the authenticated user has an admin role.
 */

import { adminClient } from './admin-client.js';
import type { User, UserRole } from '../../connect/types/domain.js';

interface LoginResponse {
    token?: string;
    user?: User;
    requiresOtp?: boolean;
    otpRequestId?: number;
    expiresAt?: string;
}

interface OTPVerifyResponse {
    token: string;
    user: User;
}

interface AdminSession {
    email: string;
    loginTime: string;
    user: User;
}

const SESSION_KEY = 'admin_session';
const IMPERSONATION_KEY = 'impersonation_session';
const ADMIN_ROLES: ReadonlySet<UserRole> = new Set(['tenant_owner', 'tenant_staff']);

class AdminAuthServiceImpl {
    private listeners: Set<(isAuthenticated: boolean) => void> = new Set();
    private currentUser: User | null = null;

    constructor() {
        adminClient.onUnauthorized = () => {
            console.warn('[Admin] Session expired — auto-logout');
            this.logout();
        };
    }

    async login(email: string, password: string): Promise<{ success: boolean; requiresOtp?: boolean; otpRequestId?: number; email?: string; expiresAt?: string; reason?: string }> {
        try {
            // Ensure platform-admin login cannot inherit any prior user-area session.
            localStorage.removeItem('auth_token');
            localStorage.removeItem('lumberboss_session');
            localStorage.removeItem('velocity_session');
            localStorage.removeItem(IMPERSONATION_KEY);

            const response = await adminClient.request<LoginResponse>('/auth/login?portal=admin', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                requiresAuth: false,
            });

            if (response.requiresOtp && response.otpRequestId) {
                return {
                    success: true,
                    requiresOtp: true,
                    otpRequestId: response.otpRequestId,
                    email,
                    expiresAt: response.expiresAt,
                };
            }

            if (!response.token || !response.user) {
                return { success: false, reason: 'Invalid login response.' };
            }

            adminClient.setToken(response.token);

            if (!ADMIN_ROLES.has(response.user.role)) {
                this.logout();
                return { success: false, reason: 'Access denied. Admin credentials required.' };
            }

            const session: AdminSession = {
                email: response.user.email,
                loginTime: new Date().toISOString(),
                user: response.user,
            };

            this.currentUser = response.user;
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            localStorage.removeItem(IMPERSONATION_KEY);
            this.notifyListeners(true);
            return { success: true };
        } catch {
            return { success: false, reason: 'Invalid email or password.' };
        }
    }

    async verifyLoginOTP(email: string, otpRequestId: number, code: string): Promise<{ success: boolean; reason?: string }> {
        try {
            const response = await adminClient.request<OTPVerifyResponse>('/auth/login/verify-otp', {
                method: 'POST',
                body: JSON.stringify({ email, otpRequestId, code }),
                requiresAuth: false,
            });

            if (!response.token) {
                return { success: false, reason: 'Missing admin token.' };
            }

            adminClient.setToken(response.token);
            const session: AdminSession = {
                email: response.user.email,
                loginTime: new Date().toISOString(),
                user: response.user,
            };
            this.currentUser = response.user;
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            localStorage.removeItem(IMPERSONATION_KEY);
            this.notifyListeners(true);
            return { success: true };
        } catch {
            return { success: false, reason: 'Invalid or expired verification code.' };
        }
    }

    async startImpersonation(targetUserId: number, targetEmail?: string): Promise<{ success: boolean; reason?: string }> {
        try {
            const response = await adminClient.request<OTPVerifyResponse>('/auth/impersonation/start', {
                method: 'POST',
                body: JSON.stringify({ targetUserId }),
            });
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('lumberboss_session', JSON.stringify({
                email: response.user.email,
                loginTime: new Date().toISOString(),
                user: response.user,
            }));
            localStorage.setItem(IMPERSONATION_KEY, JSON.stringify({
                active: true,
                startedAt: new Date().toISOString(),
                targetUserId: response.user.id,
                targetEmail: targetEmail || response.user.email,
            }));
            return { success: true };
        } catch {
            return { success: false, reason: 'Failed to start impersonation.' };
        }
    }

    logout(): void {
        adminClient.clearToken();
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(IMPERSONATION_KEY);
        this.currentUser = null;
        this.notifyListeners(false);
    }

    isAuthenticated(): boolean {
        return this.getSession() !== null;
    }

    getSession(): AdminSession | null {
        const data = localStorage.getItem(SESSION_KEY);
        if (!data) return null;

        try {
            return JSON.parse(data) as AdminSession;
        } catch {
            return null;
        }
    }

    getUser(): User | null {
        if (this.currentUser) return this.currentUser;
        const session = this.getSession();
        return session?.user ?? null;
    }

    subscribe(listener: (isAuthenticated: boolean) => void): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notifyListeners(isAuthenticated: boolean): void {
        this.listeners.forEach((listener) => listener(isAuthenticated));
    }
    /**
     * Development helper to bypass login locally.
     * Accessible via window.devLogin() in development.
     */
    devLogin(role: UserRole = 'tenant_owner'): void {
        const user: User = {
            id: 1,
            name: 'Dev Admin',
            email: 'dev@test.com',
            role: role,
            phone: '555-0100',
            isActive: true
        };
        const session: AdminSession = {
            email: user.email,
            loginTime: new Date().toISOString(),
            user: user
        };

        // precise keys used by the service
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        adminClient.setToken('mock-dev-token');

        this.currentUser = user;
        this.notifyListeners(true);
        window.location.reload();
    }
}

export const AdminAuthService = new AdminAuthServiceImpl();

// Expose devLogin globally in development
if (import.meta.env.DEV) {
    (window as any).devLogin = (role?: UserRole) => AdminAuthService.devLogin(role);
}
