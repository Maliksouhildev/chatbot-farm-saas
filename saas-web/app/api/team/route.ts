import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get('ownerId');
    if (!ownerId) return NextResponse.json({ error: 'Missing ownerId' }, { status: 400 });

    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;

    const team = users.users.filter(u => u.user_metadata?.workspace_owner_id === ownerId).map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || u.email?.split('@')[0],
      permissions: u.user_metadata?.permissions || {
        view_analytics: false,
        modify_settings: false,
        toggle_ai: false,
        assigned_channels: []
      }
    }));

    return NextResponse.json({ team });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { ownerId, email, name, permissions } = await req.json();
    if (!ownerId || !email) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    // For a burner account, we create the user with a default password or invite them.
    // Here we'll just mock it if it fails, but try to create via admin.
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: 'TeamPassword123!',
      user_metadata: {
        full_name: name,
        workspace_owner_id: ownerId,
        permissions: permissions || {
          view_analytics: false,
          modify_settings: false,
          toggle_ai: false,
          assigned_channels: []
        }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json({ error: 'User with this email already exists.' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ 
      id: user.user.id, 
      email: user.user.email, 
      name, 
      permissions: user.user.user_metadata.permissions 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId, permissions } = await req.json();
    if (!userId || !permissions) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const { data: user, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        permissions
      }
    });

    if (error) throw error;

    return NextResponse.json({ success: true, permissions: user.user.user_metadata.permissions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

