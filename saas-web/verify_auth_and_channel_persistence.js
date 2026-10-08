const http = require('http');

async function testFetch(url, options = {}) {
  return fetch(url, options);
}

async function runTests() {
  console.log('=== STARTING AUTH & CHANNEL PERSISTENCE TESTS ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // 1. Insecure Login Bypasses: Wrong Password Must Return 401
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@chatbotfarm.local', password: 'random_wrong_password_12345' })
    });
    const data = await res.json();
    assert(res.status === 401, 'Login with incorrect password returns 401', `Got status ${res.status}: ${JSON.stringify(data)}`);
    assert(data.error && data.error.includes('Invalid email or password'), 'Login error message is strictly "Invalid email or password"');
  } catch (err) {
    assert(false, 'Login with incorrect password endpoint call', err.message);
  }

  // 2. Login with Non-Existent User Must Return 401
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent_user_99999@test.com', password: 'AnyPassword123!' })
    });
    const data = await res.json();
    assert(res.status === 401, 'Login with nonexistent user returns 401', `Got status ${res.status}`);
  } catch (err) {
    assert(false, 'Login with nonexistent user endpoint call', err.message);
  }

  // 3. Email Verification Endpoint: Reject Missing Code and Unknown Email
  try {
    const resMissing = await fetch('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    assert(resMissing.status === 400, 'Verify email with missing code returns 400');

    const resNotFound = await fetch('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent_user_99999@test.com', code: '000000' })
    });
    assert(resNotFound.status === 404, 'Verify email with nonexistent account returns 404');
  } catch (err) {
    assert(false, 'Verify email endpoint call', err.message);
  }

  // 4. Resend Verification Endpoint: Missing Email Validation
  try {
    const res = await fetch('http://localhost:3000/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await res.json();
    assert(res.status === 400, 'Resend verification without email returns 400', `Got status ${res.status}`);
  } catch (err) {
    assert(false, 'Resend verification endpoint call', err.message);
  }

  // 5. WhatsApp Channel: Evolution API Live Verification
  try {
    const res = await fetch('http://localhost:3000/api/channels/whatsapp/chats');
    const data = await res.json();
    assert(res.status === 200, 'WhatsApp chats API returns 200 OK');
    assert(data.instance !== null && typeof data.instance === 'object', 'WhatsApp returns live instance info');
    assert(data.instance.phone === '+213551671229', 'WhatsApp connected instance owner phone is +213551671229', `Got: ${data.instance?.phone}`);
    assert(Array.isArray(data.chats) && data.chats.length >= 25, `WhatsApp returns authentic live chats (found ${data.chats?.length})`);
    
    // Check that chats are real WhatsApp conversations, not synthetic mock objects
    const hasRealChats = data.chats.some(c => c.id.includes('@s.whatsapp.net') || c.id.includes('@g.us'));
    assert(hasRealChats, 'WhatsApp chat IDs are authentic Evolution JIDs (@s.whatsapp.net / @g.us)');
    
    const hasAhmedY = data.chats.some(c => c.name === 'Ahmed Y.');
    assert(!hasAhmedY, 'WhatsApp chats list contains ZERO synthetic mock Ahmed Y. contacts');
  } catch (err) {
    assert(false, 'WhatsApp channel endpoint call', err.message);
  }

  // 6. Verify Mock Chats Isolation
  try {
    const fs = require('fs');
    const mockFileContent = fs.readFileSync('./lib/mock_chats.ts', 'utf8');
    const getContactsImpl = mockFileContent.includes('export const getContactsForApp = (appId: string, isConnected: boolean): ContactProfile[] => {\n  return [];\n};');
    assert(getContactsImpl, 'lib/mock_chats.ts getContactsForApp strictly returns []');
  } catch (err) {
    assert(false, 'lib/mock_chats.ts inspection', err.message);
  }

  // 7. Verify Auth Backdoors Completely Removed from Login Route
  try {
    const fs = require('fs');
    const loginRouteContent = fs.readFileSync('./app/api/auth/login/route.ts', 'utf8');
    const hasListUsersBackdoor = loginRouteContent.includes('listUsers');
    assert(!hasListUsersBackdoor, 'app/api/auth/login/route.ts has ZERO listUsers backdoor fallback');
    const hasRealVerify = loginRouteContent.includes('signInWithPassword');
    assert(hasRealVerify, 'app/api/auth/login/route.ts strictly uses supabase.auth.signInWithPassword');
  } catch (err) {
    assert(false, 'app/api/auth/login/route.ts inspection', err.message);
  }

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

runTests();
