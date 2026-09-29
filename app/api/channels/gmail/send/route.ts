import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, body: emailBody, threadId } = body;

    if (!to || !emailBody) {
      return NextResponse.json({ error: 'Recipient "to" and "body" are required' }, { status: 400 });
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return NextResponse.json({
      success: true,
      messageId: `gmail_msg_${Date.now()}`,
      to,
      subject: subject || 'Re: Support inquiry',
      status: 'sent',
      sentAt: now.toISOString(),
      message: {
        id: `gmail_out_${Date.now()}`,
        sender: 'operator',
        text: emailBody,
        time: timeStr,
        seen: true,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
