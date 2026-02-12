import { client } from '../client';
import type { User, NotificationPreferences, UpdateProfilePayload, ChangePasswordPayload } from '../types/domain';

interface LoginResponse {
    token?: string;
    user?: User;
    requiresOtp?: boolean;
    otpRequestId?: number;
    expiresAt?: string;
    portal?: string;
}

export const AuthService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await client.request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            requiresAuth: false,
        });

        if (response.token) {
            client.setToken(response.token);
        }

        return response;
    },

    getProfile: () => client.request<User>('/auth/me'),

    logout: () => {
        client.setToken('');
        localStorage.removeItem('auth_token');
    },

    /**
     * Update user profile
     * MAPS TO: PUT /users/{userId}
     */
    updateProfile: (userId: number, payload: UpdateProfilePayload): Promise<User> =>
        client.request<User>(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        }),

    /**
     * Change user password
     * MAPS TO: POST /auth/change-password
     */
    changePassword: (payload: ChangePasswordPayload): Promise<void> =>
        client.request<void>('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    /**
     * Update notification preferences
     * MAPS TO: PUT /users/{userId}/notifications
     */
    updateNotifications: (userId: number, prefs: NotificationPreferences): Promise<NotificationPreferences> =>
        client.request<NotificationPreferences>(`/users/${userId}/notifications`, {
            method: 'PUT',
            body: JSON.stringify(prefs),
        }),
};
