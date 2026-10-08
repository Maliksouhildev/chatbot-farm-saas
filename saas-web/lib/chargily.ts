/**
 * Chargily Pay v2 Integration for Algerian Dinar (DZD) Payments
 * Supports EDAHABIA & CIB Cards with automated webhook activation.
 */

export interface ChargilyCheckoutParams {
    userId: string;
    userEmail: string;
    userName: string;
    planTier: 'starter' | 'pro' | 'byok';
    amountDzd: number;
    successUrl: string;
    failureUrl: string;
}

export class ChargilyService {
    private secretKey: string;
    private baseUrl: string;

    constructor() {
        this.secretKey = process.env.CHARGILY_SECRET_KEY || '';
        // Chargily Pay v2 API Endpoint (Sandbox / Production)
        this.baseUrl = process.env.CHARGILY_API_URL || 'https://pay.chargily.net/test/api/v2';
    }

    /**
     * Create an EDAHABIA / CIB payment checkout session
     */
    async createCheckout(params: ChargilyCheckoutParams) {
        const response = await fetch(`${this.baseUrl}/checkouts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.secretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: params.amountDzd,
                currency: 'dzd',
                payment_method: 'edahabia', // Supports both EDAHABIA and CIB
                success_url: params.successUrl,
                failure_url: params.failureUrl,
                webhook_endpoint: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/chargily`,
                metadata: {
                    user_id: params.userId,
                    plan_tier: params.planTier,
                    customer_email: params.userEmail,
                    customer_name: params.userName,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Chargily checkout creation failed: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        return {
            checkoutUrl: data.checkout_url,
            invoiceId: data.id,
        };
    }

    /**
     * Verify webhook signature from Chargily Pay
     */
    verifySignature(signature: string, payload: string): boolean {
        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', this.secretKey)
            .update(payload)
            .digest('hex');
        return signature === expectedSignature;
    }
}
