import { client } from '../client';
import type { TeamMember, TeamMemberRole, InviteMemberPayload } from '../types/domain';

/**
 * MembersService - Team member management
 * MAPS TO: /accounts/{accountId} member endpoints
 */
export const MembersService = {
    /**
     * Get all team members for an account
     * MAPS TO: GET /accounts/{accountId}/members
     */
    getMembers: (accountId: number): Promise<TeamMember[]> =>
        client.request<TeamMember[]>(`/accounts/${accountId}/members`),

    /**
     * Invite a new team member
     * MAPS TO: POST /accounts/{accountId}/invite
     */
    inviteMember: (accountId: number, payload: InviteMemberPayload): Promise<TeamMember> =>
        client.request<TeamMember>(`/accounts/${accountId}/invite`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    /**
     * Update a team member's role
     * MAPS TO: PUT /accounts/{accountId}/members/{memberId}
     */
    updateMember: (accountId: number, memberId: number, role: TeamMemberRole): Promise<TeamMember> =>
        client.request<TeamMember>(`/accounts/${accountId}/members/${memberId}`, {
            method: 'PUT',
            body: JSON.stringify({ role }),
        }),

    /**
     * Remove a team member
     * MAPS TO: DELETE /accounts/{accountId}/members/{memberId}
     */
    removeMember: (accountId: number, memberId: number): Promise<void> =>
        client.request<void>(`/accounts/${accountId}/members/${memberId}`, {
            method: 'DELETE',
        }),
};
