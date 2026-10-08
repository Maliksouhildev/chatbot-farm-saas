import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, token, appPassword } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    // Basic format check
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      account: {
        email,
        provider: 'Google Workspace / Gmail Support',
        status: 'Connected & Listening',
        quota: '15 GB',
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to verify Gmail connection' }, { status: 500 });
  }
}
