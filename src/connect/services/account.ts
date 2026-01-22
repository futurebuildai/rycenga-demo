import { client } from '../client.js';
import type { Account, AccountAddress } from '../types/domain.js';

/**
 * AccountFinancials - Financial summary for an account
 * MAPS TO: GET /accounts/{id}/financials
 */
export interface AccountFinancials {
    creditLimit: number;
    balance: number;
    availableCredit: number;
}

/**
 * AccountService - Account management and profile data
 * MAPS TO: /accounts endpoints
 */
export const AccountService = {
    /**
     * List all accounts for the authenticated user/tenant
     * MAPS TO: GET /accounts
     */
    getAccounts: (): Promise<Account[]> =>
        client.request<Account[]>('/accounts'),

    /**
     * Get details for a specific account
     * MAPS TO: GET /accounts/{id}
     */
    getAccount: (id: number): Promise<Account> =>
        client.request<Account>(`/accounts/${id}`),

    /**
     * List addresses for an account
     * MAPS TO: GET /accounts/{id}/addresses
     */
    getAccountAddresses: (id: number): Promise<AccountAddress[]> =>
        client.request<AccountAddress[]>(`/accounts/${id}/addresses`),

    /**
     * Get financial summary (credit limit, balance, available credit)
     * MAPS TO: GET /accounts/{id}/financials
     */
    getAccountFinancials: (id: number): Promise<AccountFinancials> =>
        client.request<AccountFinancials>(`/accounts/${id}/financials`),
};
