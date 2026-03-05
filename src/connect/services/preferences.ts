import { client } from '../client.js';
import type { NotificationPreferences } from '../types/domain.js';

/**
 * PreferencesService - User notification preferences scoped to the current account
 * MAPS TO: /me/preferences
 */
export const PreferencesService = {
    /**
     * Get notification preferences for the authenticated user's current account
     * MAPS TO: GET /me/preferences
     */
    getPreferences: (): Promise<NotificationPreferences> =>
        client.request<NotificationPreferences>('/me/preferences'),

    /**
     * Update notification preferences for the authenticated user's current account
     * MAPS TO: PUT /me/preferences
     */
    updatePreferences: (prefs: NotificationPreferences): Promise<NotificationPreferences> =>
        client.request<NotificationPreferences>('/me/preferences', {
            method: 'PUT',
            body: JSON.stringify(prefs),
        }),
};
