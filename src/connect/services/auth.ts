import { client } from '../client';
import type { User } from '../types/domain';

interface LoginResponse {
    token: string;
    user: User;
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
    }
};
