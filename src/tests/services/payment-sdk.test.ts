import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PaymentSDKService } from '../../connect/services/payment-sdk';
import { BillingService } from '../../connect/services/billing';
import type { CardTokenizeInput, ACHTokenizeInput } from '../../connect/types/domain';

// Mock event for script callbacks
const mockEvent = {} as Event;

// Mock BillingService
vi.mock('../../connect/services/billing', () => ({
    BillingService: {
        getPaymentConfig: vi.fn(),
    },
}));

describe('PaymentSDKService', () => {
    let originalCreateElement: typeof document.createElement;
    let mockScript: HTMLScriptElement;
    let mockAppendChild: ReturnType<typeof vi.fn<[Node], Node>>;

    beforeEach(() => {
        // Reset SDK state before each test
        PaymentSDKService.reset();

        // Clear all mocks
        vi.clearAllMocks();

        // Clean up window.RunPayments
        delete (window as { RunPayments?: unknown }).RunPayments;

        // Store original createElement
        originalCreateElement = document.createElement.bind(document);

        // Mock script element
        mockScript = {
            src: '',
            async: false,
            onload: null as (() => void) | null,
            onerror: null as (() => void) | null,
            addEventListener: vi.fn(),
        } as unknown as HTMLScriptElement;

        // Mock document.createElement for script tags
        vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
            if (tagName === 'script') {
                return mockScript;
            }
            return originalCreateElement(tagName);
        });

        // Mock document.head.appendChild
        mockAppendChild = vi.fn().mockImplementation(() => {
            // Simulate successful script load
            setTimeout(() => {
                if (mockScript.onload) {
                    mockScript.onload(mockEvent);
                }
            }, 0);
            return mockScript;
        });
        vi.spyOn(document.head, 'appendChild').mockImplementation(mockAppendChild);

        // Mock document.querySelector to return null (no existing script)
        vi.spyOn(document, 'querySelector').mockReturnValue(null);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        PaymentSDKService.reset();
        delete (window as { RunPayments?: unknown }).RunPayments;
    });

    describe('SDK Loading', () => {
        it('should inject script into document head', async () => {
            // Setup mock SDK
            const mockInit = vi.fn();
            vi.mocked(BillingService.getPaymentConfig).mockResolvedValue({ publicKey: 'pk_test' });

            // Simulate script load setting window.RunPayments
            mockAppendChild.mockImplementation(() => {
                setTimeout(() => {
                    (window as { RunPayments?: unknown }).RunPayments = {
                        init: mockInit,
                        tokenize: vi.fn(),
                    };
                    if (mockScript.onload) {
                        mockScript.onload(mockEvent);
                    }
                }, 0);
                return mockScript;
            });

            await PaymentSDKService.initialize();

            expect(document.createElement).toHaveBeenCalledWith('script');
            expect(mockScript.src).toBe('https://js.runpayments.com/v1/runner.js');
            expect(mockScript.async).toBe(true);
            expect(document.head.appendChild).toHaveBeenCalled();
        });

        it('should handle script load failure', async () => {
            mockAppendChild.mockImplementation(() => {
                setTimeout(() => {
                    if (mockScript.onerror) {
                        mockScript.onerror(mockEvent);
                    }
                }, 0);
                return mockScript;
            });

            await expect(PaymentSDKService.initialize()).rejects.toThrow('Failed to load Run Payments SDK');
        });

        it('should cache load promise and return same promise', async () => {
            const mockInit = vi.fn();
            vi.mocked(BillingService.getPaymentConfig).mockResolvedValue({ publicKey: 'pk_test' });

            mockAppendChild.mockImplementation(() => {
                setTimeout(() => {
                    (window as { RunPayments?: unknown }).RunPayments = {
                        init: mockInit,
                        tokenize: vi.fn(),
                    };
                    if (mockScript.onload) {
                        mockScript.onload(mockEvent);
                    }
                }, 0);
                return mockScript;
            });

            // Call initialize multiple times simultaneously
            const promise1 = PaymentSDKService.initialize();
            const promise2 = PaymentSDKService.initialize();

            await Promise.all([promise1, promise2]);

            // Script should only be created once
            expect(document.head.appendChild).toHaveBeenCalledTimes(1);
        });

        it('should allow retry after failure', async () => {
            // First attempt fails
            mockAppendChild.mockImplementationOnce(() => {
                setTimeout(() => {
                    if (mockScript.onerror) {
                        mockScript.onerror(mockEvent);
                    }
                }, 0);
                return mockScript;
            });

            await expect(PaymentSDKService.initialize()).rejects.toThrow();

            // Reset for retry
            PaymentSDKService.reset();

            // Second attempt succeeds
            const mockInit = vi.fn();
            vi.mocked(BillingService.getPaymentConfig).mockResolvedValue({ publicKey: 'pk_test' });
            mockAppendChild.mockImplementation(() => {
                setTimeout(() => {
                    (window as { RunPayments?: unknown }).RunPayments = {
                        init: mockInit,
                        tokenize: vi.fn(),
                    };
                    if (mockScript.onload) {
                        mockScript.onload(mockEvent);
                    }
                }, 0);
                return mockScript;
            });

            await PaymentSDKService.initialize();
            expect(PaymentSDKService.isReady()).toBe(true);
        });
    });

    describe('initialize', () => {
        it('should fetch config and call SDK init', async () => {
            const mockInit = vi.fn();
            vi.mocked(BillingService.getPaymentConfig).mockResolvedValue({ publicKey: 'pk_live_xyz' });

            mockAppendChild.mockImplementation(() => {
                setTimeout(() => {
                    (window as { RunPayments?: unknown }).RunPayments = {
                        init: mockInit,
                        tokenize: vi.fn(),
                    };
                    if (mockScript.onload) {
                        mockScript.onload(mockEvent);
                    }
                }, 0);
                return mockScript;
            });

            await PaymentSDKService.initialize();

            expect(BillingService.getPaymentConfig).toHaveBeenCalled();
            expect(mockInit).toHaveBeenCalledWith({ publicKey: 'pk_live_xyz' });
        });

        it('should store public key after initialization', async () => {
            const mockInit = vi.fn();
            vi.mocked(BillingService.getPaymentConfig).mockResolvedValue({ publicKey: 'pk_test_abc' });

            mockAppendChild.mockImplementation(() => {
                setTimeout(() => {
                    (window as { RunPayments?: unknown }).RunPayments = {
                        init: mockInit,
                        tokenize: vi.fn(),
                    };
                    if (mockScript.onload) {
                        mockScript.onload(mockEvent);
                    }
                }, 0);
                return mockScript;
            });

            await PaymentSDKService.initialize();

            expect(PaymentSDKService.getPublicKey()).toBe('pk_test_abc');
        });
    });

    describe('tokenizeCard', () => {
        it('should call SDK tokenize with card data', async () => {
            const mockTokenize = vi.fn().mockResolvedValue({
                token: 'tok_card_123',
                last4: '4242',
                brand: 'visa',
                expMonth: 12,
                expYear: 2025,
            });

            vi.mocked(BillingService.getPaymentConfig).mockResolvedValue({ publicKey: 'pk_test' });

            mockAppendChild.mockImplementation(() => {
                setTimeout(() => {
                    (window as { RunPayments?: unknown }).RunPayments = {
                        init: vi.fn(),
                        tokenize: mockTokenize,
                    };
                    if (mockScript.onload) {
                        mockScript.onload(mockEvent);
                    }
                }, 0);
                return mockScript;
            });

            const cardInput: CardTokenizeInput = {
                cardNumber: '4242424242424242',
                expMonth: 12,
                expYear: 2025,
                cvc: '123',
            };

            const result = await PaymentSDKService.tokenizeCard(cardInput);

            expect(mockTokenize).toHaveBeenCalledWith({
                type: 'card',
                card: {
                    number: '4242424242424242',
                    expMonth: 12,
                    expYear: 2025,
                    cvc: '123',
                },
            });
            expect(result.token).toBe('tok_card_123');
            expect(result.last4).toBe('4242');
        });
    });

    describe('tokenizeACH', () => {
        it('should call SDK tokenize with ACH data', async () => {
            const mockTokenize = vi.fn().mockResolvedValue({
                token: 'tok_ach_456',
                last4: '6789',
            });

            vi.mocked(BillingService.getPaymentConfig).mockResolvedValue({ publicKey: 'pk_test' });

            mockAppendChild.mockImplementation(() => {
                setTimeout(() => {
                    (window as { RunPayments?: unknown }).RunPayments = {
                        init: vi.fn(),
                        tokenize: mockTokenize,
                    };
                    if (mockScript.onload) {
                        mockScript.onload(mockEvent);
                    }
                }, 0);
                return mockScript;
            });

            const achInput: ACHTokenizeInput = {
                routingNumber: '021000021',
                accountNumber: '123456789',
                accountType: 'checking',
            };

            const result = await PaymentSDKService.tokenizeACH(achInput);

            expect(mockTokenize).toHaveBeenCalledWith({
                type: 'ach',
                ach: {
                    routingNumber: '021000021',
                    accountNumber: '123456789',
                    accountType: 'checking',
                },
            });
            expect(result.token).toBe('tok_ach_456');
        });
    });

    describe('Error sanitization', () => {
        it('should not expose card numbers in error messages', async () => {
            const mockTokenize = vi.fn().mockRejectedValue(
                new Error('Invalid card number: 4242424242424242')
            );

            vi.mocked(BillingService.getPaymentConfig).mockResolvedValue({ publicKey: 'pk_test' });

            mockAppendChild.mockImplementation(() => {
                setTimeout(() => {
                    (window as { RunPayments?: unknown }).RunPayments = {
                        init: vi.fn(),
                        tokenize: mockTokenize,
                    };
                    if (mockScript.onload) {
                        mockScript.onload(mockEvent);
                    }
                }, 0);
                return mockScript;
            });

            const cardInput: CardTokenizeInput = {
                cardNumber: '4242424242424242',
                expMonth: 12,
                expYear: 2025,
                cvc: '123',
            };

            try {
                await PaymentSDKService.tokenizeCard(cardInput);
                expect.fail('Should have thrown');
            } catch (error) {
                expect((error as Error).message).not.toContain('4242424242424242');
                expect((error as Error).message).toContain('[REDACTED]');
            }
        });

        it('should sanitize CVV from error messages', async () => {
            const mockTokenize = vi.fn().mockRejectedValue(
                new Error('Invalid CVC: 123')
            );

            vi.mocked(BillingService.getPaymentConfig).mockResolvedValue({ publicKey: 'pk_test' });

            mockAppendChild.mockImplementation(() => {
                setTimeout(() => {
                    (window as { RunPayments?: unknown }).RunPayments = {
                        init: vi.fn(),
                        tokenize: mockTokenize,
                    };
                    if (mockScript.onload) {
                        mockScript.onload(mockEvent);
                    }
                }, 0);
                return mockScript;
            });

            const cardInput: CardTokenizeInput = {
                cardNumber: '4111111111111111',
                expMonth: 12,
                expYear: 2025,
                cvc: '123',
            };

            try {
                await PaymentSDKService.tokenizeCard(cardInput);
                expect.fail('Should have thrown');
            } catch (error) {
                expect((error as Error).message).toContain('[REDACTED]');
            }
        });
    });

    describe('isReady', () => {
        it('should return false before initialization', () => {
            expect(PaymentSDKService.isReady()).toBe(false);
        });

        it('should return true after successful initialization', async () => {
            vi.mocked(BillingService.getPaymentConfig).mockResolvedValue({ publicKey: 'pk_test' });

            mockAppendChild.mockImplementation(() => {
                setTimeout(() => {
                    (window as { RunPayments?: unknown }).RunPayments = {
                        init: vi.fn(),
                        tokenize: vi.fn(),
                    };
                    if (mockScript.onload) {
                        mockScript.onload(mockEvent);
                    }
                }, 0);
                return mockScript;
            });

            await PaymentSDKService.initialize();

            expect(PaymentSDKService.isReady()).toBe(true);
        });
    });

    describe('reset', () => {
        it('should clear all SDK state', async () => {
            vi.mocked(BillingService.getPaymentConfig).mockResolvedValue({ publicKey: 'pk_test' });

            mockAppendChild.mockImplementation(() => {
                setTimeout(() => {
                    (window as { RunPayments?: unknown }).RunPayments = {
                        init: vi.fn(),
                        tokenize: vi.fn(),
                    };
                    if (mockScript.onload) {
                        mockScript.onload(mockEvent);
                    }
                }, 0);
                return mockScript;
            });

            await PaymentSDKService.initialize();
            expect(PaymentSDKService.isReady()).toBe(true);
            expect(PaymentSDKService.getPublicKey()).toBe('pk_test');

            PaymentSDKService.reset();

            expect(PaymentSDKService.isReady()).toBe(false);
            expect(PaymentSDKService.getPublicKey()).toBeNull();
        });
    });
});
