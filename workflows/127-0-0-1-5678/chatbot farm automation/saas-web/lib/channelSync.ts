/**
 * Secure Cross-Device Channel Synchronization
 * Persists and restores all connected channel credentials (Telegram, WhatsApp, Viber, Snapchat, Instagram, etc.)
 * in Supabase Cloud so any device signed into the user's account gains instant access without re-syncing.
 */

function setStorageDual(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
    const activeProj = localStorage.getItem('cf_active_workspace_id');
    if (activeProj && activeProj !== 'default') {
      localStorage.setItem(`${key}_${activeProj}`, value);
    }
  } catch {}
}

function removeStorageDual(key: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
    const activeProj = localStorage.getItem('cf_active_workspace_id');
    if (activeProj && activeProj !== 'default') {
      localStorage.removeItem(`${key}_${activeProj}`);
    }
  } catch {}
}

export async function saveChannelToCloud(userId: string, channel: string, credentials: Record<string, any>) {
  if (!userId || !channel) return;
  try {
    const res = await fetch('/api/user/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, channel, credentials }),
    });
    return await res.json();
  } catch (err) {
    console.warn(`Failed to sync channel ${channel} to cloud:`, err);
  }
}

export async function deleteChannelFromCloud(userId: string, channel: string) {
  if (!userId || !channel) return;
  try {
    const res = await fetch('/api/user/channels', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, channel }),
    });
    return await res.json();
  } catch (err) {
    console.warn(`Failed to remove channel ${channel} from cloud:`, err);
  }
}

export async function fetchUserChannelsFromCloud(userId: string) {
  if (!userId) return null;
  try {
    const res = await fetch(`/api/user/channels?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Failed to load user channels from cloud:', err);
    return null;
  }
}

export async function saveQuickTemplatesToCloud(userId: string, quickTemplates: any[]) {
  if (!userId || !quickTemplates) return;
  try {
    const res = await fetch('/api/user/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, quickTemplates }),
    });
    return await res.json();
  } catch (err) {
    console.warn('Failed to sync quick templates to cloud:', err);
  }
}

export function applyCloudChannelsToLocalStorage(channels: Record<string, any>, quickTemplates?: any[]) {
  if (typeof window === 'undefined') return;

  try {
    // 0. Quick Templates cross-device sync
    if (quickTemplates && Array.isArray(quickTemplates) && quickTemplates.length > 0) {
      setStorageDual('cf_quick_templates_v2', JSON.stringify(quickTemplates));
    }

    if (!channels) return;
    // 1. WhatsApp
    if (channels.whatsapp?.connected) {
      setStorageDual('cf_whatsapp_linked', 'true');
      if (channels.whatsapp.number) {
        setStorageDual('cf_whatsapp_number', channels.whatsapp.number);
      }
      if (channels.whatsapp.name) {
        setStorageDual('cf_whatsapp_name', channels.whatsapp.name);
      }
      removeStorageDual('cf_whatsapp_unlinked');
    }

    // 2. Telegram
    if (channels.telegram?.connected) {
      if (channels.telegram.session) {
        setStorageDual('cf_telegram_session', channels.telegram.session);
      }
      if (channels.telegram.token) {
        setStorageDual('cf_telegram_token', channels.telegram.token);
      }
      if (channels.telegram.user) {
        setStorageDual('cf_telegram_user', typeof channels.telegram.user === 'string' ? channels.telegram.user : JSON.stringify(channels.telegram.user));
      }
      if (channels.telegram.bot) {
        setStorageDual('cf_telegram_bot', typeof channels.telegram.bot === 'string' ? channels.telegram.bot : JSON.stringify(channels.telegram.bot));
      }
      removeStorageDual('cf_telegram_unlinked');
    }

    // 3. Viber
    if (channels.viber?.connected) {
      if (channels.viber.account) {
        setStorageDual('cf_viber_account', typeof channels.viber.account === 'string' ? channels.viber.account : JSON.stringify(channels.viber.account));
      }
      if (channels.viber.phone) {
        setStorageDual('cf_viber_phone', channels.viber.phone);
      }
      if (channels.viber.token) {
        setStorageDual('cf_viber_token', channels.viber.token);
      }
      removeStorageDual('cf_viber_unlinked');
    }

    // 4. Snapchat
    if (channels.snapchat?.connected) {
      if (channels.snapchat.account) {
        setStorageDual('cf_snapchat_account', typeof channels.snapchat.account === 'string' ? channels.snapchat.account : JSON.stringify(channels.snapchat.account));
      }
      if (channels.snapchat.username) {
        setStorageDual('cf_snapchat_username', channels.snapchat.username);
      }
      if (channels.snapchat.phone) {
        setStorageDual('cf_snapchat_phone', channels.snapchat.phone);
      }
      if (channels.snapchat.token) {
        setStorageDual('cf_snapchat_token', channels.snapchat.token);
      }
      removeStorageDual('cf_snapchat_unlinked');
    }

    // 5. Instagram
    if (channels.instagram?.connected) {
      if (channels.instagram.account) {
        setStorageDual('cf_ig_account', typeof channels.instagram.account === 'string' ? channels.instagram.account : JSON.stringify(channels.instagram.account));
      }
      if (channels.instagram.metaAuth) {
        setStorageDual('cf_meta_auth', typeof channels.instagram.metaAuth === 'string' ? channels.instagram.metaAuth : JSON.stringify(channels.instagram.metaAuth));
      }
      removeStorageDual('cf_instagram_unlinked');
    }

    // 6. Messenger
    if (channels.messenger?.connected) {
      if (channels.messenger.page) {
        setStorageDual('cf_messenger_page', typeof channels.messenger.page === 'string' ? channels.messenger.page : JSON.stringify(channels.messenger.page));
      }
      removeStorageDual('cf_messenger_unlinked');
    }

    // 7. Discord
    if (channels.discord?.connected) {
      if (channels.discord.token) {
        setStorageDual('cf_discord_token', channels.discord.token);
      }
      if (channels.discord.account) {
        setStorageDual('cf_discord_account', typeof channels.discord.account === 'string' ? channels.discord.account : JSON.stringify(channels.discord.account));
      }
      removeStorageDual('cf_discord_unlinked');
    }

    // 8. Signal
    if (channels.signal?.connected) {
      if (channels.signal.account) {
        setStorageDual('cf_signal_account', typeof channels.signal.account === 'string' ? channels.signal.account : JSON.stringify(channels.signal.account));
      }
      if (channels.signal.phone) {
        setStorageDual('cf_signal_phone', channels.signal.phone);
      }
      removeStorageDual('cf_signal_unlinked');
    }

    // 9. Gmail Support
    if (channels.gmail?.connected) {
      if (channels.gmail.email) {
        setStorageDual('cf_gmail_account', JSON.stringify({ email: channels.gmail.email, name: channels.gmail.name || '' }));
      }
      if (channels.gmail.token) {
        setStorageDual('cf_google_access_token', channels.gmail.token);
      }
      removeStorageDual('cf_gmail_unlinked');
    }

    // 10. Update connected_apps list respecting explicit unlinks
    const currentApps = new Set<string>();
    try {
      const stored = localStorage.getItem('cf_connected_apps');
      if (stored) {
        JSON.parse(stored).forEach((a: string) => {
          if (localStorage.getItem(`cf_${a}_unlinked`) !== 'true') {
            currentApps.add(a);
          }
        });
      }
    } catch {}

    Object.keys(channels).forEach((ch) => {
      if (channels[ch]?.connected !== false) {
        if (localStorage.getItem(`cf_${ch}_unlinked`) !== 'true') {
          currentApps.add(ch);
        }
      } else {
        currentApps.delete(ch);
      }
    });

    const appsArr = Array.from(currentApps);
    setStorageDual('cf_connected_apps', JSON.stringify(appsArr));

    // Notify all listening components
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn('Error applying cloud channels to localStorage:', e);
  }
}
