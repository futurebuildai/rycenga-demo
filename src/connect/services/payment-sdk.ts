import { BillingService } from './billing';
import type { CardTokenizeInput, ACHTokenizeInput, TokenResponse } from '../types/domain';

/**
 * Run Payments SDK global interface
 * This is injected by the SDK script from js.runpayments.com
 */
declare global {
    interface Window {
        RunPayments?: {
            init: (config: { publicKey: string }) => void;
            tokenize: (data: {
                type: 'card' | 'ach';
                card?: {
                    number: string;
                    expMonth: number;
                    expYear: number;
                    cvc: string;
                };
                ach?: {
                    routingNumber: string;
                    accountNumber: string;
                    accountType: 'checking' | 'savings';
                };
            }) => Promise<TokenResponse>;
        };
    }
}

const SDK_URL = 'https://js.runpayments.com/v1/runner.js';

/**
 * SDK state management
 */
interface SDKState {
    loaded: boolean;
    initialized: boolean;
    publicKey: string | null;
    loadPromise: Promise<void> | null;
    initPromise: Promise<void> | null;
}

const sdkState: SDKState = {
    loaded: false,
    initialized: false,
    publicKey: null,
    loadPromise: null,
    initPromise: null,
};

/**
 * Sanitize error messages to prevent leaking sensitive card data
 */
function sanitizeError(error: unknown): Error {
    const message = error instanceof Error ? error.message : String(error);
    // Remove any potential card numbers (13-19 digit sequences)
    const sanitized = message.replace(/\b\d{13,19}\b/g, '[REDACTED]');
    // Remove any potential CVV (3-4 digit sequences that look like CVV context)
    const finalMessage = sanitized.replace(/\b(cvv|cvc|security code)[:\s]*\d{3,4}\b/gi, '$1: [REDACTED]');
    return new Error(finalMessage);
}

/**
 * Load the Run Payments SDK script
 * Returns a cached promise if already loading/loaded
 */
function loadSDK(): Promise<void> {
    // Return cached promise if exists
    if (sdkState.loadPromise) {
        return sdkState.loadPromise;
    }

    // Already loaded
    if (sdkState.loaded && window.RunPayments) {
        return Promise.resolve();
    }

    sdkState.loadPromise = new Promise((resolve, reject) => {
        // Check if script already exists in DOM
        const existingScript = document.querySelector(`script[src="${SDK_URL}"]`);
        if (existingScript) {
            if (window.RunPayments) {
                sdkState.loaded = true;
                resolve();
            } else {
                existingScript.addEventListener('load', () => {
                    sdkState.loaded = true;
                    resolve();
                });
                existingScript.addEventListener('error', () => {
                    sdkState.loadPromise = null;
                    reject(new Error('Failed to load Run Payments SDK'));
                });
            }
            return;
        }

        // Create and inject script
        const script = document.createElement('script');
        script.src = SDK_URL;
        script.async = true;

        script.onload = () => {
            sdkState.loaded = true;
            resolve();
        };

        script.onerror = () => {
            sdkState.loadPromise = null;
            reject(new Error('Failed to load Run Payments SDK'));
        };

        document.head.appendChild(script);
    });

    return sdkState.loadPromise;
}

/**
 * Initialize the SDK with the public key from the backend
 */
async function initialize(): Promise<void> {
    // Return cached promise if already initializing
    if (sdkState.initPromise) {
        return sdkState.initPromise;
    }

    // Already initialized
    if (sdkState.initialized) {
        return Promise.resolve();
    }

    sdkState.initPromise = (async () => {
        // Load SDK first
        await loadSDK();

        if (!window.RunPayments) {
            throw new Error('Run Payments SDK not available after loading');
        }

        // Fetch public key from backend
        const config = await BillingService.getPaymentConfig();
        sdkState.publicKey = config.publicKey;

        // Initialize SDK
        window.RunPayments.init({ publicKey: config.publicKey });
        sdkState.initialized = true;
    })();

    try {
        await sdkState.initPromise;
    } catch (error) {
        // Reset promise on failure to allow retry
        sdkState.initPromise = null;
        throw error;
    }

    return sdkState.initPromise;
}

/**
 * PaymentSDKService - Handles Run Payments SDK loading and tokenization
 *
 * PCI-DSS Compliance Notes:
 * - Card data (CardTokenizeInput) must NEVER be stored/logged
 * - Form inputs should be cleared immediately after tokenization
 * - Only tokens should be sent to your backend
 */
export const PaymentSDKService = {
    /**
     * Check if SDK is loaded and initialized
     */
    isReady: (): boolean => sdkState.loaded && sdkState.initialized,

    /**
     * Get the loaded public key (null if not initialized)
     */
    getPublicKey: (): string | null => sdkState.publicKey,

    /**
     * Ensure SDK is loaded and initialized
     * Call this before tokenization, or it will be called automatically
     */
    initialize,

    /**
     * Tokenize card data
     * PCI-DSS: The input data must NOT be stored anywhere
     *
     * @param data Card details to tokenize
     * @returns Token response with token and card metadata
     */
    tokenizeCard: async (data: CardTokenizeInput): Promise<TokenResponse> => {
        try {
            await initialize();

            if (!window.RunPayments) {
                throw new Error('Run Payments SDK not available');
            }

            const response = await window.RunPayments.tokenize({
                type: 'card',
                card: {
                    number: data.cardNumber,
                    expMonth: data.expMonth,
                    expYear: data.expYear,
                    cvc: data.cvc,
                },
            });

            return response;
        } catch (error) {
            throw sanitizeError(error);
        }
    },

    /**
     * Tokenize ACH bank account data
     *
     * @param data Bank account details to tokenize
     * @returns Token response with token and account metadata
     */
    tokenizeACH: async (data: ACHTokenizeInput): Promise<TokenResponse> => {
        try {
            await initialize();

            if (!window.RunPayments) {
                throw new Error('Run Payments SDK not available');
            }

            const response = await window.RunPayments.tokenize({
                type: 'ach',
                ach: {
                    routingNumber: data.routingNumber,
                    accountNumber: data.accountNumber,
                    accountType: data.accountType,
                },
            });

            return response;
        } catch (error) {
            throw sanitizeError(error);
        }
    },

    /**
     * Reset SDK state - useful for testing
     */
    reset: (): void => {
        sdkState.loaded = false;
        sdkState.initialized = false;
        sdkState.publicKey = null;
        sdkState.loadPromise = null;
        sdkState.initPromise = null;
    },
};
