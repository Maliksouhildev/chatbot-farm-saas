import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Chargily Pay Webhook Endpoint
 * Handles real-time EDAHABIA / CIB payment notifications to activate subscriptions.
 */
export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get('signature');
        const secretKey = process.env.CHARGILY_SECRET_KEY || '';

        // Validate Chargily Signature
        if (signature && secretKey) {
            const calculatedSignature = crypto
                .createHmac('sha256', secretKey)
                .update(rawBody)
                .digest('hex');

            if (signature !== calculatedSignature) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
            }
        }

        const payload = JSON.parse(rawBody);
        const eventType = payload.event;
        const checkoutData = payload.data;

        if (eventType === 'checkout.paid') {
            const userId = checkoutData.metadata?.user_id;
            const planTier = checkoutData.metadata?.plan_tier || 'starter';
            const amountDzd = checkoutData.amount;
            const invoiceId = checkoutData.id;

            const quotaMap: Record<string, number> = {
                starter: 1500,
                pro: 4000,
                byok: 999999,
            };

            const creditQuota = quotaMap[planTier] || 1500;
            const supabaseUrl = process.env.SUPABASE_URL;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (userId && supabaseUrl && serviceKey) {
                // 1. Update or create active subscription
                await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
                    method: 'POST',
                    headers: {
                        'apikey': serviceKey,
                        'Authorization': `Bearer ${serviceKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'resolution=merge-duplicates',
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        plan_tier: planTier,
                        status: 'active',
                        monthly_message_quota: creditQuota,
                        credits_remaining: creditQuota,
                        billing_gateway: 'chargily',
                        current_period_start: new Date().toISOString(),
                        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        updated_at: new Date().toISOString(),
                    }),
                });

                // 2. Record payment transaction
                await fetch(`${supabaseUrl}/rest/v1/payments`, {
                    method: 'POST',
                    headers: {
                        'apikey': serviceKey,
                        'Authorization': `Bearer ${serviceKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        amount_dzd: amountDzd,
                        plan_tier: planTier,
                        gateway: 'chargily',
                        chargily_invoice_id: invoiceId,
                        status: 'approved',
                    }),
                });
            }
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error('Chargily Webhook Processing Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
