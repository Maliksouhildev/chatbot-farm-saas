import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

// GET: Retrieve all connected channels and credentials for an authenticated user
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const { data: { user }, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr || !user) {
      return NextResponse.json({ error: 'User not found or unauthorized.' }, { status: 404 });
    }

    const metadata = user.user_metadata || {};
    const channels = metadata.channels || {};
    const preferences = metadata.preferences || {};
    const connectedApps: string[] = Array.isArray(preferences.connectedApps)
      ? preferences.connectedApps
      : Object.keys(channels).filter(k => channels[k]?.connected !== false);
    const quickTemplates = preferences.quickTemplates || null;

    return NextResponse.json({
      success: true,
      userId: user.id,
      channels,
      connectedApps,
      preferences,
      quickTemplates,
    });
  } catch (err: any) {
    console.error('Error in GET /api/user/channels:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// POST: Save or update a connected channel's configuration & credentials in the cloud
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, channel, credentials, quickTemplates } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const { data: { user }, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr || !user) {
      return NextResponse.json({ error: 'User not found or unauthorized.' }, { status: 404 });
    }

    const existingMeta = user.user_metadata || {};
    const existingChannels = existingMeta.channels || {};
    const existingPrefs = existingMeta.preferences || {};
    const existingConnectedApps: string[] = Array.isArray(existingPrefs.connectedApps)
      ? existingPrefs.connectedApps
      : [];

    // Support syncing quickTemplates across all devices
    if (quickTemplates !== undefined) {
      const nextPrefs = {
        ...existingPrefs,
        quickTemplates,
      };

      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...existingMeta,
          preferences: nextPrefs,
        },
      });

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Quick templates synced to cloud successfully.',
        quickTemplates,
      });
    }

    if (!channel) {
      return NextResponse.json({ error: 'Channel name is required.' }, { status: 400 });
    }

    // Store sanitized channel payload
    const updatedChannelData = {
      ...(existingChannels[channel] || {}),
      ...(credentials || {}),
      connected: true,
      updatedAt: new Date().toISOString(),
    };

    const nextChannels = {
      ...existingChannels,
      [channel]: updatedChannelData,
    };

    // Ensure channel is included in connectedApps
    const nextConnectedApps = Array.from(new Set([...existingConnectedApps, channel]));

    const { data: updatedUser, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...existingMeta,
        channels: nextChannels,
        preferences: {
          ...existingPrefs,
          connectedApps: nextConnectedApps,
        },
      },
    });

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Channel ${channel} synced to cloud successfully.`,
      channel,
      channels: nextChannels,
      connectedApps: nextConnectedApps,
    });
  } catch (err: any) {
    console.error('Error in POST /api/user/channels:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// DELETE: Disconnect or remove a channel from the user's cloud account
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { userId, channel } = body;

    if (!userId || !channel) {
      return NextResponse.json({ error: 'User ID and channel are required.' }, { status: 400 });
    }

    const { data: { user }, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userErr || !user) {
      return NextResponse.json({ error: 'User not found or unauthorized.' }, { status: 404 });
    }

    const existingMeta = user.user_metadata || {};
    const existingChannels = { ...(existingMeta.channels || {}) };
    const existingPrefs = existingMeta.preferences || {};
    const existingConnectedApps: string[] = Array.isArray(existingPrefs.connectedApps)
      ? existingPrefs.connectedApps
      : [];

    delete existingChannels[channel];
    const nextConnectedApps = existingConnectedApps.filter(c => c !== channel);

    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...existingMeta,
        channels: existingChannels,
        preferences: {
          ...existingPrefs,
          connectedApps: nextConnectedApps,
        },
      },
    });

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Channel ${channel} removed from cloud.`,
      channels: existingChannels,
      connectedApps: nextConnectedApps,
    });
  } catch (err: any) {
    console.error('Error in DELETE /api/user/channels:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
