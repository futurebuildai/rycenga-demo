import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BillingService } from '../../connect/services/billing';
import { client } from '../../connect/client';
import type { PaymentMethod, PaymentMethodCreatePayload, PaymentConfig, PaymentTransaction, Statement } from '../../connect/types/domain';

// Mock the client
vi.mock('../../connect/client', () => ({
    client: {
        request: vi.fn(),
    },
}));

describe('BillingService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getPaymentMethods', () => {
        it('should call /payment-methods endpoint', async () => {
            const mockMethods: PaymentMethod[] = [
                {
                    id: 1,
                    type: 'card',
                    brand: 'visa',
                    last4: '4242',
                    expMonth: 12,
                    expYear: 2025,
                    isDefault: true,
                },
            ];
            vi.mocked(client.request).mockResolvedValue(mockMethods);

            const result = await BillingService.getPaymentMethods();

            expect(client.request).toHaveBeenCalledWith('/payment-methods');
            expect(result).toEqual(mockMethods);
        });
    });

    describe('getPaymentConfig', () => {
        it('should call /payment-config endpoint', async () => {
            const mockConfig: PaymentConfig = {
                publicKey: 'pk_test_12345',
            };
            vi.mocked(client.request).mockResolvedValue(mockConfig);

            const result = await BillingService.getPaymentConfig();

            expect(client.request).toHaveBeenCalledWith('/payment-config');
            expect(result).toEqual(mockConfig);
        });

        it('should return publicKey from response', async () => {
            const mockConfig: PaymentConfig = {
                publicKey: 'pk_live_abcdef',
            };
            vi.mocked(client.request).mockResolvedValue(mockConfig);

            const result = await BillingService.getPaymentConfig();

            expect(result.publicKey).toBe('pk_live_abcdef');
        });
    });

    describe('createPaymentMethod', () => {
        it('should POST to /payment-methods with token data', async () => {
            const mockPayload: PaymentMethodCreatePayload = {
                accountToken: 'tok_test_12345',
                name: 'John Doe',
                type: 'card',
                brand: 'visa',
                last4: '4242',
                expMonth: 12,
                expYear: 2025,
                isDefault: true,
            };
            const mockResponse: PaymentMethod = {
                id: 1,
                type: 'card',
                brand: 'visa',
                last4: '4242',
                expMonth: 12,
                expYear: 2025,
                isDefault: true,
            };
            vi.mocked(client.request).mockResolvedValue(mockResponse);

            const result = await BillingService.createPaymentMethod(mockPayload);

            expect(client.request).toHaveBeenCalledWith('/payment-methods', {
                method: 'POST',
                body: JSON.stringify(mockPayload),
            });
            expect(result).toEqual(mockResponse);
        });

        it('should pass token correctly in payload', async () => {
            const mockPayload: PaymentMethodCreatePayload = {
                accountToken: 'tok_ach_67890',
                name: 'Jane Smith',
                type: 'ach',
            };
            vi.mocked(client.request).mockResolvedValue({ id: 2 });

            await BillingService.createPaymentMethod(mockPayload);

            const callArgs = vi.mocked(client.request).mock.calls[0];
            const body = JSON.parse(callArgs[1]?.body as string);
            expect(body.accountToken).toBe('tok_ach_67890');
        });
    });

    describe('getPaymentHistory', () => {
        it('should call /payments endpoint', async () => {
            const mockTransactions: PaymentTransaction[] = [
                {
                    id: 1,
                    accountId: 100,
                    userId: 1,
                    externalId: 'ext_123',
                    provider: 'run_payments',
                    status: 'settled',
                    currencyCode: 'USD',
                    amount: 10000,
                    convenienceFee: 0,
                    totalCharged: 10000,
                    paymentMethodType: 'card',
                    submittedAt: '2024-01-15T10:00:00Z',
                    settledAt: '2024-01-15T10:05:00Z',
                    failureCode: null,
                    failureMessage: null,
                },
            ];
            vi.mocked(client.request).mockResolvedValue(mockTransactions);

            const result = await BillingService.getPaymentHistory();

            expect(client.request).toHaveBeenCalledWith('/payments');
            expect(result).toEqual(mockTransactions);
        });

        it('should return empty array when no transactions', async () => {
            vi.mocked(client.request).mockResolvedValue([]);

            const result = await BillingService.getPaymentHistory();

            expect(result).toEqual([]);
        });
    });

    describe('getStatements', () => {
        it('should call /statements endpoint', async () => {
            const mockStatements: Statement[] = [
                {
                    id: 1,
                    accountId: 100,
                    statementNumber: 'STM-2024-001',
                    periodStart: '2024-01-01',
                    periodEnd: '2024-01-31',
                    statementDate: '2024-02-01',
                    currencyCode: 'USD',
                    openingBalance: 0,
                    closingBalance: 5000,
                    documentId: 123,
                    createdAt: '2024-02-01T00:00:00Z',
                },
            ];
            vi.mocked(client.request).mockResolvedValue(mockStatements);

            const result = await BillingService.getStatements();

            expect(client.request).toHaveBeenCalledWith('/statements');
            expect(result).toEqual(mockStatements);
        });
    });
});
