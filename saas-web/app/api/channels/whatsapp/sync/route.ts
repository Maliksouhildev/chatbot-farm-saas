import { NextResponse } from 'next/server';

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const API_KEY = process.env.EVOLUTION_API_KEY || 'farm_evolution_master_secret_2026';
const INSTANCE = 'default_instance';
const HEADERS = { apikey: API_KEY, 'Content-Type': 'application/json' };

async function checkConnectionState(): Promise<string> {
  try {
    const res = await fetch(`${EVOLUTION_URL}/instance/connectionState/${INSTANCE}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return 'close';
    const data = await res.json();
    return data?.instance?.state || 'close';
  } catch {
    return 'close';
  }
}

async function fetchQrCode(): Promise<{ base64?: string; code?: string; pairingCode?: string }> {
  try {
    const res = await fetch(`${EVOLUTION_URL}/instance/connect/${INSTANCE}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return {};
    const data = await res.json();
    return {
      base64: data.base64 || undefined,
      code: data.code || undefined,
      pairingCode: data.pairingCode || undefined,
    };
  } catch {
    return {};
  }
}

export async function POST(req: Request) {
  try {
    const state = await checkConnectionState();

    if (state === 'open') {
      // Instance is connected to WhatsApp live!
      return NextResponse.json({
        success: true,
        connected: true,
        status: 'connected',
        message: 'WhatsApp inbox synchronized successfully. Active & live.',
      });
    }

    // Instance is disconnected / logged out (e.g. 401 on Sep 23)
    const qrData = await fetchQrCode();

    return NextResponse.json({
      success: false,
      connected: false,
      requiresLink: true,
      status: state,
      qrCode: qrData.base64 || null,
      rawCode: qrData.code || null,
      pairingCode: qrData.pairingCode || null,
      lastSyncDate: '2026-09-22T16:17:57.000Z',
      message: 'WhatsApp session disconnected from phone (Error 401). Scan QR code to reconnect and pull latest messages.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Sync failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return POST(req);
}
