import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientId, text, pageId, token } = body;

    const activePageId = pageId || process.env.FB_PAGE_ID;
    const pageAccessToken = token || process.env.FB_PAGE_ACCESS_TOKEN;

    if (!recipientId || !text) {
      return NextResponse.json({ error: 'recipientId and text are required' }, { status: 400 });
    }

    if (!pageAccessToken || !activePageId) {
      // Mock success if live token not yet connected
      return NextResponse.json({
        success: true,
        mock: true,
        messageId: `fb_msg_${Date.now()}`,
        status: 'sent_locally'
      });
    }

    // Call Meta Graph API to send page message
    const res = await fetch(`https://graph.facebook.com/v19.0/${activePageId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text },
        messaging_type: 'RESPONSE',
        access_token: pageAccessToken,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      return NextResponse.json({ error: data.error?.message || 'Failed to send Messenger message' }, { status: res.status });
    }

    return NextResponse.json({
      success: true,
      messageId: data.message_id,
      recipientId: data.recipient_id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
