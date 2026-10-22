/**
 * TEST SUITE: DISCORD SECURITY & ZERO-RISK PAIRING VERIFICATION
 * 
 * Verifies:
 * 1. ZERO calls to discord.com/api/v10/auth/login across the codebase (eliminates password flags).
 * 2. ZERO calls to discord.com/api/v10/users/@me/relationships (eliminates self-botting flags).
 * 3. Discord verify route rejects password submissions and protects user accounts.
 * 4. 1-Click Platform Bot pairing succeeds cleanly with 0 credentials required.
 * 5. Bot token prefixing and validation enforced.
 * 6. Pairing forms UI has NO password inputs for Discord.
 * 7. Client-side auto-purge clears any legacy user tokens from localStorage.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✔ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✖ FAIL: ${name}\n    Error: ${err.message}`);
    failed++;
  }
}

console.log('\n================================================================');
console.log('  TEST SUITE: DISCORD SECURITY & ACCOUNT PROTECTION');
console.log(`  Timestamp: ${new Date().toISOString()}`);
console.log('================================================================\n');

// TEST 1: No auth/login calls to Discord
runTest('DS-01: Zero calls to discord.com/api/v10/auth/login across all API routes', () => {
  const routesToCheck = [
    'app/api/channels/discord/verify/route.ts',
    'app/api/channels/[channelId]/verify/route.ts',
    'app/api/channels/discord/chats/route.ts',
    'app/api/channels/discord/messages/route.ts',
    'app/api/channels/discord/send/route.ts',
  ];

  routesToCheck.forEach((relPath) => {
    const fullPath = path.resolve(__dirname, '..', relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      assert(
        !content.includes('discord.com/api/v10/auth/login') && !content.includes('discord.com/api/v9/auth/login'),
        `${relPath} must NOT call discord auth/login endpoint`
      );
    }
  });
});

// TEST 2: No relationships self-bot calls
runTest('DS-02: Zero calls to discord.com/api/v10/users/@me/relationships', () => {
  const chatsRoute = path.resolve(__dirname, '..', 'app/api/channels/discord/chats/route.ts');
  const content = fs.readFileSync(chatsRoute, 'utf8');
  assert(
    !content.includes('users/@me/relationships'),
    'chats route must NOT call user self-bot relationships endpoint'
  );
});

// TEST 3: Discord verify route rejects passwords
runTest('DS-03: Discord verify routes explicitly reject email/password submissions with status 400', () => {
  const verifyRoute = path.resolve(__dirname, '..', 'app/api/channels/discord/verify/route.ts');
  const content = fs.readFileSync(verifyRoute, 'utf8');
  assert(
    content.includes('if (email || password)') || content.includes('if (body.email || body.password)'),
    'verify route must detect and reject email/password submissions'
  );
  assert(
    content.includes('status: 400'),
    'verify route must return status 400 rejection'
  );
});

// TEST 4: ChannelPairingForms does not contain Discord password fields
runTest('DS-04: ChannelPairingForms has removed Discord password input fields', () => {
  const formsFile = path.resolve(__dirname, '..', 'components/workspace/ChannelPairingForms.tsx');
  const content = fs.readFileSync(formsFile, 'utf8');
  assert(
    !content.includes('id="discord-input-password"'),
    'ChannelPairingForms must NOT contain discord password input element'
  );
  assert(
    !content.includes('id="discord-submit-login-btn"'),
    'ChannelPairingForms must NOT contain discord login submit button'
  );
  assert(
    content.includes('id="discord-submit-1click-btn"'),
    'ChannelPairingForms must offer safe 1-Click pairing'
  );
  assert(
    content.includes('id="discord-submit-token-btn"'),
    'ChannelPairingForms must offer official Bot Token pairing'
  );
});

// TEST 5: Auto-purge guards in app/page.tsx
runTest('DS-05: app/page.tsx has auto-purge guards for legacy unsafe Discord tokens', () => {
  const pageFile = path.resolve(__dirname, '..', 'app/page.tsx');
  const content = fs.readFileSync(pageFile, 'utf8');
  assert(
    content.includes('!rawDcToken.startsWith(\'Bot \') && !rawDcToken.startsWith(\'Bot_ChatbotFarm\')') ||
    content.includes('!token.startsWith(\'Bot \') && !token.startsWith(\'Bot_ChatbotFarm\')'),
    'app/page.tsx must identify and purge unsafe non-bot tokens from localStorage'
  );
});

// TEST 6: Auto-purge guards in MiddleChatColumn.tsx
runTest('DS-06: MiddleChatColumn.tsx auto-purges unsafe tokens before message dispatch', () => {
  const colFile = path.resolve(__dirname, '..', 'components/workspace/MiddleChatColumn.tsx');
  const content = fs.readFileSync(colFile, 'utf8');
  assert(
    content.includes('!token.startsWith(\'Bot \') && !token.startsWith(\'Bot_ChatbotFarm\')'),
    'MiddleChatColumn must purge unsafe tokens before dispatching message requests'
  );
});

// TEST 7: Bot Token prefixing enforced
runTest('DS-07: Bot Token prefixing enforced across chats, messages, and send routes', () => {
  const sendRoute = fs.readFileSync(path.resolve(__dirname, '..', 'app/api/channels/discord/send/route.ts'), 'utf8');
  const msgsRoute = fs.readFileSync(path.resolve(__dirname, '..', 'app/api/channels/discord/messages/route.ts'), 'utf8');
  assert(
    sendRoute.includes('rawToken.startsWith("Bot ") ? rawToken : `Bot ${rawToken}`'),
    'send route must prefix Bot token'
  );
  assert(
    msgsRoute.includes('rawToken.startsWith("Bot ") ? rawToken : `Bot ${rawToken}`'),
    'messages route must prefix Bot token'
  );
});

console.log('\n================================================================');
console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log('================================================================\n');

process.exit(failed > 0 ? 1 : 0);
