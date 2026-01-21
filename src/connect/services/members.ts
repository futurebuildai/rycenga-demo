import { client } from '../client';
import type { TeamMember, TeamMemberRole, InviteMemberPayload } from '../types/domain';

/**
 * MembersService - Team member management
 * MAPS TO: /account/{accountId}/members endpoints
 */
export const MembersService = {
    /**
     * Get all team members for an account
     * MAPS TO: GET /account/{accountId}/members
     */
    getMembers: (accountId: number): Promise<TeamMember[]> =>
        client.request<TeamMember[]>(`/account/${accountId}/members`),

    /**
     * Invite a new team member
     * MAPS TO: POST /account/{accountId}/members/invite
     */
    inviteMember: (accountId: number, payload: InviteMemberPayload): Promise<TeamMember> =>
        client.request<TeamMember>(`/account/${accountId}/members/invite`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    /**
     * Update a team member's role
     * MAPS TO: PUT /account/{accountId}/members/{memberId}
     */
    updateMember: (accountId: number, memberId: number, role: TeamMemberRole): Promise<TeamMember> =>
        client.request<TeamMember>(`/account/${accountId}/members/${memberId}`, {
            method: 'PUT',
            body: JSON.stringify({ role }),
        }),

    /**
     * Remove a team member
     * MAPS TO: DELETE /account/{accountId}/members/{memberId}
     */
    removeMember: (accountId: number, memberId: number): Promise<void> =>
        client.request<void>(`/account/${accountId}/members/${memberId}`, {
            method: 'DELETE',
        }),
};
