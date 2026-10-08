import { NextResponse } from 'next/server';

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const API_KEY = process.env.EVOLUTION_API_KEY || 'farm_evolution_master_secret_2026';
const INSTANCE = 'default_instance';
const HEADERS = { apikey: API_KEY, 'Content-Type': 'application/json' };

export async function POST() {
  try {
    // Call Evolution API DELETE /instance/logout/default_instance
    try {
      await fetch(`${EVOLUTION_URL}/instance/logout/${INSTANCE}`, {
        method: 'DELETE',
        headers: HEADERS,
      });
    } catch (err) {
      console.warn('Evolution API logout error:', err);
    }

    return NextResponse.json({
      success: true,
      status: 'unlinked',
      message: 'WhatsApp instance unlinked and logged out successfully',
    });
  } catch (err: any) {
    console.error('Error logging out WhatsApp instance:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  return POST();
}
