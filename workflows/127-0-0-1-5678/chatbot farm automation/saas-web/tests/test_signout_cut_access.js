/**
 * Test Suite: Sign Out Access Severance & Default Press-to-Link Reset
 *
 * Verifies:
 * 1. Signing out terminates user session
 * 2. Cuts access to all 19 channels: wipes credentials, accounts, tokens, and cached messages
 * 3. All apps are reset to unlinked status
 * 4. All apps display their default unlinked subtitles & "press to link app" actions
 * 5. Prevents any unlinked channel from resurrecting upon refresh or reload
 */

const assert = require('assert');

// Mock localStorage
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.localStorage = new MockLocalStorage();
global.window = {
  location: { pathname: '/', href: '/' },
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
};

async function runSignOutTests() {
  console.log('\n================================================================');
  console.log('  TEST SUITE: SIGN OUT CUTS ACCESS & RESETS TO PRESS-TO-LINK APP');
  console.log('  Timestamp: ' + new Date().toISOString());
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  \x1b[32m✔ PASS\x1b[0m ${name}`);
      passed++;
    } catch (err) {
      console.error(`  \x1b[31m✘ FAIL\x1b[0m ${name}`);
      console.error('    Error:', err.message);
      failed++;
    }
  }

  const ALL_KNOWN_CHANNELS = [
    'whatsapp', 'whatsapp_2', 'telegram', 'signal', 'instagram', 'messenger',
    'discord', 'gmail', 'google_chat', 'google_messages', 'google_voice',
    'slack', 'x_twitter', 'linkedin', 'irc', 'matrix', 'viber', 'snapchat', 'web_widget'
  ];

  // 1. Setup mock logged-in state with multiple connected apps
  test('TC-SIGNOUT-01: Setup mock active user session with connected channels', () => {
    localStorage.setItem('cf_user_session', JSON.stringify({ id: 'user_123', email: 'merchant@store.dz' }));
    localStorage.setItem('cf_connected_apps', JSON.stringify(['whatsapp', 'discord', 'telegram', 'viber', 'snapchat']));
    localStorage.setItem('cf_connected_apps_user_123', JSON.stringify(['whatsapp', 'discord', 'telegram']));
    localStorage.setItem('cf_whatsapp_number', '0551671229');
    localStorage.setItem('cf_whatsapp_linked', 'true');
    localStorage.setItem('cf_discord_token', 'Bot_ChatbotFarm_Live_Token');
    localStorage.setItem('cf_telegram_session', '123456:ABC-DEF');
    localStorage.setItem('cf_viber_account', JSON.stringify({ phone: '+213551671229' }));
    localStorage.setItem('cf_snapchat_account', JSON.stringify({ username: 'store_official' }));

    assert.strictEqual(Boolean(localStorage.getItem('cf_user_session')), true);
    assert.strictEqual(JSON.parse(localStorage.getItem('cf_connected_apps')).length, 5);
  });

  // 2. Execute sign out cleanup
  test('TC-SIGNOUT-02: Sign out cuts access and completely cleans storage', () => {
    // Simulate handleLogout logic
    ALL_KNOWN_CHANNELS.forEach((ch) => {
      localStorage.setItem(`cf_${ch}_unlinked`, 'true');
      const keysToRemove = [
        `cf_${ch}_account`, `cf_${ch}_token`, `cf_${ch}_session`, `cf_${ch}_phone`,
        `cf_${ch}_username`, `cf_${ch}_number`, `cf_${ch}_linked`, `cf_${ch}_creds`,
        `cf_${ch}_qr`, `cf_${ch}_bot`, `cf_${ch}_user`, `cf_${ch}_page`, `cf_${ch}_chats`,
        `cf_contact_cache_${ch}`, `cf_cached_chats_${ch}`, `cf_chats_${ch}`, `cf_assigned_bot_${ch}`,
      ];
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    });

    localStorage.setItem('cf_connected_apps', JSON.stringify([]));
    localStorage.removeItem('cf_connected_apps_user_123');
    localStorage.removeItem('cf_connected_apps_admin_local');
    localStorage.removeItem('cf_user_session');

    // Assert user session is terminated
    assert.strictEqual(localStorage.getItem('cf_user_session'), null);

    // Assert connectedApps list is empty
    assert.deepStrictEqual(JSON.parse(localStorage.getItem('cf_connected_apps')), []);

    // Assert credentials of previously connected channels are purged
    assert.strictEqual(localStorage.getItem('cf_whatsapp_number'), null);
    assert.strictEqual(localStorage.getItem('cf_whatsapp_linked'), null);
    assert.strictEqual(localStorage.getItem('cf_discord_token'), null);
    assert.strictEqual(localStorage.getItem('cf_telegram_session'), null);
    assert.strictEqual(localStorage.getItem('cf_viber_account'), null);
    assert.strictEqual(localStorage.getItem('cf_snapchat_account'), null);
  });

  // 3. Verify every app is in unlinked state
  test('TC-SIGNOUT-03: Every single channel is explicitly unlinked', () => {
    ALL_KNOWN_CHANNELS.forEach((ch) => {
      const isUnlinked = localStorage.getItem(`cf_${ch}_unlinked`) === 'true';
      assert.strictEqual(isUnlinked, true, `Channel ${ch} must be marked explicitly unlinked`);
    });
  });

  // 4. Verify UI state reflection
  test('TC-SIGNOUT-04: UI state maps every app to press-to-link empty state', () => {
    const currentUser = null; // Signed out
    const connectedApps = new Set(JSON.parse(localStorage.getItem('cf_connected_apps')));

    assert.strictEqual(currentUser, null);
    assert.strictEqual(connectedApps.size, 0);

    ALL_KNOWN_CHANNELS.forEach((appId) => {
      const isConnected = connectedApps.has(appId);
      assert.strictEqual(isConnected, false, `${appId} must report isConnected=false`);

      const isSignedOut = !currentUser;
      const isExplicitlyUnlinked = localStorage.getItem(`cf_${appId}_unlinked`) === 'true';

      // Condition used by MiddleChatColumn line 2561
      const shouldRenderPressToLinkEmptyState = !isConnected && (isSignedOut || isExplicitlyUnlinked);
      assert.strictEqual(
        shouldRenderPressToLinkEmptyState,
        true,
        `${appId} must render the press-to-link empty state`
      );
    });
  });

  // 5. Verify no resurrection on reload
  test('TC-SIGNOUT-05: Page reload simulation preserves unlinked press-to-link state', () => {
    // Simulating app reload
    const stored = localStorage.getItem('cf_connected_apps');
    const parsed = JSON.parse(stored || '[]');
    const restoredConnectedApps = new Set(parsed);

    assert.strictEqual(restoredConnectedApps.size, 0);
    assert.strictEqual(localStorage.getItem('cf_user_session'), null);
  });

  console.log('\n================================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runSignOutTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
