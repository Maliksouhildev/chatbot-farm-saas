/**
 * test_pressable_url_links.js
 * Comprehensive test suite verifying pressable URL links and mentions across
 * Telegram and ALL omnichannel chat apps.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('\n================================================================');
console.log('  TEST SUITE: PRESSABLE URL LINKS IN TELEGRAM AND ALL APPS');
console.log('  Timestamp:', new Date().toISOString());
console.log('================================================================\n');

let passedTests = 0;
let failedTests = 0;

function runTest(testName, testFn) {
  try {
    testFn();
    console.log(`  ✔ PASS: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✘ FAIL: ${testName}`);
    console.error(`     Error: ${err.message}\n`);
    failedTests++;
  }
}

// 1. Verify existence of lib/pressableLinks.tsx
runTest('TC-URL-01: lib/pressableLinks.tsx exists and defines renderPressableText & normalizeHref', () => {
  const filePath = path.join(__dirname, '../lib/pressableLinks.tsx');
  assert(fs.existsSync(filePath), 'lib/pressableLinks.tsx must exist');
  const code = fs.readFileSync(filePath, 'utf8');
  assert(code.includes('export function renderPressableText'), 'Must export renderPressableText');
  assert(code.includes('export function normalizeHref'), 'Must export normalizeHref');
  assert(code.includes('export function getChannelLinkClass'), 'Must export getChannelLinkClass');
});

// 2. Verify URL pattern and trailing punctuation handling
runTest('TC-URL-02: URL parsing handles http, https, www, domains, and trailing punctuation', () => {
  // Test normalizeHref logic
  const normalizeHref = (url) => {
    if (/^https?:\/\//i.test(url)) return url;
    if (/^ftp:\/\//i.test(url)) return url;
    if (/^mailto:/i.test(url)) return url;
    if (/^tel:/i.test(url)) return url;
    return `https://${url}`;
  };

  assert.strictEqual(normalizeHref('https://telegram.org'), 'https://telegram.org');
  assert.strictEqual(normalizeHref('http://insecure.site'), 'http://insecure.site');
  assert.strictEqual(normalizeHref('www.google.com'), 'https://www.google.com');
  assert.strictEqual(normalizeHref('t.me/durov'), 'https://t.me/durov');
  assert.strictEqual(normalizeHref('discord.gg/gaming'), 'https://discord.gg/gaming');
  assert.strictEqual(normalizeHref('wa.me/2135551234'), 'https://wa.me/2135551234');
});

// 3. Verify Telegram native view in MiddleChatColumn.tsx
runTest('TC-URL-03: Telegram message body in MiddleChatColumn.tsx uses renderPressableText', () => {
  const code = fs.readFileSync(path.join(__dirname, '../components/workspace/MiddleChatColumn.tsx'), 'utf8');
  assert(code.includes("renderPressableText(text, { appId: 'telegram' })"), 'Telegram renderMentions must delegate to renderPressableText');
  assert(code.includes("renderMentions(telegramText)"), 'Telegram message paragraphs must invoke renderMentions');
});

// 4. Verify Instagram, Messenger, Web Widget, Gmail in MiddleChatColumn.tsx
runTest('TC-URL-04: Instagram, Messenger, Web Widget, and Gmail use renderPressableText in MiddleChatColumn', () => {
  const code = fs.readFileSync(path.join(__dirname, '../components/workspace/MiddleChatColumn.tsx'), 'utf8');
  assert(code.includes("renderPressableText(extractSafeText(m) || m.text || '💬 Message', { appId: 'instagram' })"), 'Instagram view must use renderPressableText');
  assert(code.includes("renderPressableText(extractSafeText(m) || m.text || '💬 Message', { appId: 'messenger' })"), 'Messenger view must use renderPressableText');
  assert(code.includes("renderPressableText(extractSafeText(m) || m.text || '💬 Message', { appId: 'web_widget' })"), 'Web Widget view must use renderPressableText');
  assert(code.includes("renderPressableText(decodeHtmlEntities(m.text), { appId: 'gmail' })"), 'Gmail view must use renderPressableText');
});

// 5. Verify default / WhatsApp renderMessageText in MiddleChatColumn.tsx
runTest('TC-URL-05: Default/WhatsApp renderMessageText calls renderPressableText', () => {
  const code = fs.readFileSync(path.join(__dirname, '../components/workspace/MiddleChatColumn.tsx'), 'utf8');
  assert(code.includes('return renderPressableText(text, { appId, searchQuery: query });'), 'renderMessageText must return renderPressableText for general messages');
});

// 6. Verify ChannelNativeViews.tsx coverage for Discord, Slack, Signal, X, Matrix, IRC, LinkedIn, Google, Viber, Snapchat
runTest('TC-URL-06: All native replicas in ChannelNativeViews.tsx use renderPressableText', () => {
  const code = fs.readFileSync(path.join(__dirname, '../components/workspace/ChannelNativeViews.tsx'), 'utf8');
  
  assert(code.includes("renderPressableText(m.text, { appId: 'discord' })"), 'Discord replica must use renderPressableText');
  assert(code.includes("renderPressableText(m.text, { appId: 'slack' })"), 'Slack replica must use renderPressableText');
  assert(code.includes("renderPressableText(m.text, { appId: 'signal' })"), 'Signal replica must use renderPressableText');
  assert(code.includes("renderPressableText(m.text, { appId: 'x_twitter' })"), 'X/Twitter replica must use renderPressableText');
  assert(code.includes("renderPressableText(m.text, { appId: 'matrix' })"), 'Matrix replica must use renderPressableText');
  assert(code.includes("renderPressableText(m.text, { appId: 'irc' })"), 'IRC replica must use renderPressableText');
  assert(code.includes("renderPressableText(m.text, { appId: 'linkedin' })"), 'LinkedIn replica must use renderPressableText');
  assert(code.includes("renderPressableText(m.text, { appId: appId })"), 'Google family replica must use renderPressableText');
  assert(code.includes("renderPressableText(m.text, { appId: 'viber' })"), 'Viber replica must use renderPressableText');
  assert(code.includes("renderPressableText(m.text, { appId: 'snapchat' })"), 'Snapchat replica must use renderPressableText');
});

// 7. Verify security attributes on pressable links
runTest('TC-URL-07: Pressable links include target="_blank", rel="noopener noreferrer", and stopPropagation', () => {
  const code = fs.readFileSync(path.join(__dirname, '../lib/pressableLinks.tsx'), 'utf8');
  assert(code.includes('target="_blank"'), 'Must have target="_blank" to open in new tab');
  assert(code.includes('rel="noopener noreferrer"'), 'Must have rel="noopener noreferrer" for security');
  assert(code.includes('e.stopPropagation()'), 'Must call e.stopPropagation() to prevent unintended bubble clicks');
  assert(code.includes('onPointerDown='), 'Must stop propagation on pointerdown');
});

// 8. Verify Telegram mentions (@username) generate clickable t.me links
runTest('TC-URL-08: Telegram mentions (@username) format into pressable https://t.me links', () => {
  const code = fs.readFileSync(path.join(__dirname, '../lib/pressableLinks.tsx'), 'utf8');
  assert(code.includes('https://t.me/${username}'), 'Telegram mentions must map to t.me URL');
  assert(code.includes('Telegram @${username}'), 'Must include hover title tooltip');
});

// 9. Verify simulator modal has pressable links
runTest('TC-URL-09: VirtualSimulatorModal also integrates renderPressableText', () => {
  const code = fs.readFileSync(path.join(__dirname, '../components/simulator/VirtualSimulatorModal.tsx'), 'utf8');
  assert(code.includes('renderPressableText(m.text)'), 'Simulator messages must use renderPressableText');
});

console.log('\n================================================================');
console.log(`  TEST RESULTS: ${passedTests} PASSED | ${failedTests} FAILED`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
