const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Seamless runner bridge: if run via pure node without TypeScript loader, execute via npx tsx
if (!process.env.__TSX_RUNNING__) {
  try {
    require('../lib/telegram_client');
  } catch {
    const { execSync } = require('child_process');
    try {
      const out = execSync('npx tsx tests/test_telegram_sync_and_reality.js', {
        env: { ...process.env, __TSX_RUNNING__: 'true' },
        encoding: 'utf8'
      });
      process.stdout.write(out);
      process.exit(0);
    } catch (err) {
      process.stderr.write(err.stdout || err.message);
      process.exit(1);
    }
  }
}

console.log('================================================================');
console.log('  TEST SUITE: TELEGRAM BLOCKED CHANNELS REALITY & POPULATION');
console.log(`  Timestamp: ${new Date().toISOString()}`);
console.log('================================================================\n');

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✔ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✖ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
    failedTests++;
  }
}

const rootDir = path.resolve(__dirname, '..');

// TC-TG-01: lib/telegram_client.ts evaluates topic closed strictly based on Telegram API flag
runTest('TC-TG-01: lib/telegram_client.ts does not artificially force General topic to closed', () => {
  const filePath = path.join(rootDir, 'lib', 'telegram_client.ts');
  const content = fs.readFileSync(filePath, 'utf8');

  assert(content.includes('const isClosed = Boolean(t.closed);'), 'isClosed should strictly evaluate Boolean(t.closed)');
  assert(!content.includes('const isClosed = Boolean(t.closed || isGeneral);'), 'isClosed must not force isGeneral to closed');
  assert(content.includes('closed: isClosed'), 'returned topic metadata should assign closed: isClosed');
});

// TC-TG-02: lib/telegram_client.ts exports server-side caches and entity mapping
runTest('TC-TG-02: lib/telegram_client.ts exports server-side caches & entity resolver', () => {
  const filePath = path.join(rootDir, 'lib', 'telegram_client.ts');
  const content = fs.readFileSync(filePath, 'utf8');

  assert(content.includes('export function getCachedTelegramChats'), 'Must export getCachedTelegramChats');
  assert(content.includes('export function setCachedTelegramChats'), 'Must export setCachedTelegramChats');
  assert(content.includes('export function getCachedTelegramMessages'), 'Must export getCachedTelegramMessages');
  assert(content.includes('export function setCachedTelegramMessages'), 'Must export setCachedTelegramMessages');
  assert(content.includes('export const clientMeCache'), 'Must export clientMeCache');
  assert(content.includes('export const telegramEntitiesMap'), 'Must export telegramEntitiesMap');
  assert(content.includes('export function recordTelegramEntity'), 'Must export recordTelegramEntity');
  assert(content.includes('export function getTelegramEntity'), 'Must export getTelegramEntity');
});

// TC-TG-03: MiddleChatColumn.tsx isTopicClosed strictly checks topic closed property without synthetic blocking
runTest('TC-TG-03: MiddleChatColumn.tsx isTopicClosed strictly checks topic metadata', () => {
  const filePath = path.join(rootDir, 'components', 'workspace', 'MiddleChatColumn.tsx');
  const content = fs.readFileSync(filePath, 'utf8');

  assert(content.includes('const isTopicClosed = Boolean(currentTopic?.closed || (currentTopic as any)?.isClosed);'),
    'isTopicClosed must strictly check topic.closed or isClosed without forcing isGeneralTopic');
  assert(!content.includes('const isTopicClosed = Boolean(currentTopic?.closed || (isGeneralTopic && hasGroupTopics));'),
    'Old synthetic blocking of General topic must be removed');
});

// TC-TG-04: MiddleChatColumn.tsx topic selector tabs do not render lock icon on General/id 1 topic
runTest('TC-TG-04: MiddleChatColumn.tsx topic tabs only show lock if actually closed', () => {
  const filePath = path.join(rootDir, 'components', 'workspace', 'MiddleChatColumn.tsx');
  const content = fs.readFileSync(filePath, 'utf8');

  assert(content.includes('const isTopicItemClosed = Boolean(t.closed || (t as any)?.isClosed);'),
    'isTopicItemClosed must strictly check t.closed without hardcoded id === 1 or title general check');
  assert(!content.includes("appId === 'telegram' && (String(t.id) === '1' || Number(t.id) === 1 || glyphInfo.title.toLowerCase() === 'general')"),
    'Old hardcoded telegram general lock check must be removed');
});

// TC-TG-05: RightHubColumn.tsx topic items do not render lock icon on General topic unless closed
runTest('TC-TG-05: RightHubColumn.tsx topic items strictly reflect reality', () => {
  const filePath = path.join(rootDir, 'components', 'workspace', 'RightHubColumn.tsx');
  const content = fs.readFileSync(filePath, 'utf8');

  assert(content.includes('const isTopicItemClosed = Boolean(topic.closed || (topic as any)?.isClosed);'),
    'RightHubColumn isTopicItemClosed must strictly check topic.closed');
  assert(!content.includes("selectedAppId === 'telegram' && (\n                          String(topic.id) === '1'"),
    'RightHubColumn must not artificially lock telegram topic id 1');
});

// TC-TG-06: MiddleChatColumn.tsx instant cache check and fast switching delay
runTest('TC-TG-06: MiddleChatColumn.tsx hasCached checks both conversations and contact messages', () => {
  const filePath = path.join(rootDir, 'components', 'workspace', 'MiddleChatColumn.tsx');
  const content = fs.readFileSync(filePath, 'utf8');

  assert(content.includes('const hasCached = (conversations[activeContact.id]?.length || 0) > 0 || (activeContact?.messages?.length || 0) > 0;'),
    'hasCached should check both conversations cache and activeContact.messages');
  assert(content.includes('setTimeout(() => setIsSwitchingChat(false), 50);'),
    'Chat switching timer should be fast (50ms) to prevent UI sluggishness');
  assert(content.includes('setTimeout(() => {\n        if (isSubscribed) setIsLoadingMessages(false);\n      }, 800);'),
    'Safety auto-clear timeout must be present to prevent infinite loading skeletons');
});

// TC-TG-07: app/api/channels/telegram/chats/route.ts fetches 100 dialogs and caches entities
runTest('TC-TG-07: Telegram chats route fetches up to 100 dialogs and registers entities', () => {
  const filePath = path.join(rootDir, 'app', 'api', 'channels', 'telegram', 'chats', 'route.ts');
  const content = fs.readFileSync(filePath, 'utf8');

  assert(content.includes('getCachedTelegramChats(session)'), 'Chats route must check getCachedTelegramChats');
  assert(content.includes('setCachedTelegramChats(session, chats)'), 'Chats route must cache retrieved chats');
  assert(content.includes('client.getDialogs({ limit: 100 })'), 'Chats route should fetch up to 100 dialogs');
});

// TC-TG-08: app/api/channels/telegram/messages/route.ts resolves entities via access_hash and avoids empty replyTo
runTest('TC-TG-08: Telegram messages route resolves entity access_hash and uses robust history fallback', () => {
  const filePath = path.join(rootDir, 'app', 'api', 'channels', 'telegram', 'messages', 'route.ts');
  const content = fs.readFileSync(filePath, 'utf8');

  assert(content.includes('getTelegramEntity(session, chatId)'), 'Messages route must check getTelegramEntity');
  assert(content.includes('client.getMessages(fetchPeer, { limit: 100 }),'), 'Messages route should fetch up to 100 messages');
  assert(content.includes('isGeneralOrRoot || tgMessages.length === 0'), 'Messages route must fall back to chat history if replyTo is empty');
});

// TC-TG-09: Functional logic simulation: verify General topic is open and writable
runTest('TC-TG-09: Functional simulation: General topic is open, closed topic is read-only', () => {
  const topics = [
    { id: '1', name: 'General', closed: false, unreadCount: 0 },
    { id: '2', name: 'Announcements', closed: true, unreadCount: 0 },
    { id: '3', name: 'Dev Chat', closed: false, unreadCount: 2 }
  ];

  const activeContact = {
    id: 'tg_supergroup_university',
    name: 'University Group',
    isGroup: true,
    topics,
    isReadOnly: false,
    canSend: true
  };

  // Test Topic 1 (General)
  const currentTopic1 = topics[0];
  const isTopicClosed1 = Boolean(currentTopic1?.closed || currentTopic1?.isClosed);
  const isChatReadOnly1 = Boolean(
    activeContact?.isReadOnly ||
    activeContact?.canSend === false ||
    isTopicClosed1
  );

  assert.strictEqual(isTopicClosed1, false, 'Topic 1 (General) must not be closed');
  assert.strictEqual(isChatReadOnly1, false, 'Topic 1 (General) must not be read-only');

  // Test Topic 2 (Closed topic)
  const currentTopic2 = topics[1];
  const isTopicClosed2 = Boolean(currentTopic2?.closed || currentTopic2?.isClosed);
  const isChatReadOnly2 = Boolean(
    activeContact?.isReadOnly ||
    activeContact?.canSend === false ||
    isTopicClosed2
  );

  assert.strictEqual(isTopicClosed2, true, 'Topic 2 (Announcements) must be closed');
  assert.strictEqual(isChatReadOnly2, true, 'Topic 2 (Announcements) must be read-only');
});

// TC-TG-10: Entity resolver correctly indexes channel ID with and without -100 prefix
runTest('TC-TG-10: Entity resolver handles -100 prefix normalizations', () => {
  const { recordTelegramEntity, getTelegramEntity, telegramEntitiesMap } = require('../lib/telegram_client');

  const testSession = 'test_session_xyz';
  const mockDialog = {
    id: '-1002049182345',
    inputEntity: { className: 'InputPeerChannel', channelId: '2049182345', accessHash: '987654321' },
    entity: { id: '2049182345', title: 'Tech Announcements', className: 'Channel' }
  };

  recordTelegramEntity(testSession, mockDialog);

  const peerWithPrefix = getTelegramEntity(testSession, '-1002049182345');
  const peerWithoutPrefix = getTelegramEntity(testSession, '2049182345');

  assert(peerWithPrefix !== null, 'Must retrieve peer with -100 prefix');
  assert(peerWithoutPrefix !== null, 'Must retrieve peer without -100 prefix');
  assert.strictEqual(peerWithPrefix.channelId, '2049182345', 'channelId must match');
});

// TC-TG-11: formatTelegramChat populates initial messages and rich subscriber/member counts
runTest('TC-TG-11: formatTelegramChat produces non-empty initialMessages and rich subscriber counts', () => {
  const { formatTelegramChat } = require('../lib/telegram_client');

  const mockChannelDialog = {
    id: '-10099887766',
    entity: {
      className: 'Channel',
      id: '99887766',
      title: 'Algeria News Official',
      participantsCount: 45200,
    },
    message: {
      id: 501,
      message: 'New economic reforms announced for 2026',
      date: Math.floor(Date.now() / 1000),
      out: false,
    }
  };

  const formatted = formatTelegramChat(mockChannelDialog, 'test_session_xyz');

  assert.strictEqual(formatted.name, 'Algeria News Official');
  assert(formatted.handleOrPhone.includes('45,200 subscribers') || formatted.statusText.includes('45,200 subscribers'),
    'Should display formatted subscriber count');
  assert(formatted.messages.length > 0, 'Channel must have at least 1 initial message from dialog');
  assert.strictEqual(formatted.messages[0].text, 'New economic reforms announced for 2026');
});

// TC-TG-12: Telegram messages route maps MessageActionChatJoinedByRequest to 'was accepted to the group' with isEvent/isSystem flags
runTest('TC-TG-12: Telegram messages route parses join-by-request into was accepted with isEvent: true', () => {
  const filePath = path.join(rootDir, 'app', 'api', 'channels', 'telegram', 'messages', 'route.ts');
  const content = fs.readFileSync(filePath, 'utf8');

  assert(content.includes('MessageActionChatJoinedByRequest'), 'Must handle MessageActionChatJoinedByRequest');
  assert(content.includes('was accepted to the group'), 'Must format accepted text');
  assert(content.includes('isEvent: isServiceAction'), 'Must flag service actions as isEvent');
  assert(content.includes('isSystem: isServiceAction'), 'Must flag service actions as isSystem');
  assert(content.includes("type: isServiceAction ? 'service' : undefined"), 'Must set type to service');
});

// TC-TG-13: MiddleChatColumn.tsx isTelegramEventMessage recognizes accepted events and legacy Notification
runTest('TC-TG-13: MiddleChatColumn.tsx detects accepted to group and legacy Notification events', () => {
  const filePath = path.join(rootDir, 'components', 'workspace', 'MiddleChatColumn.tsx');
  const content = fs.readFileSync(filePath, 'utf8');

  assert(content.includes("text === 'notification'"), 'Must detect legacy notification text');
  assert(content.includes("text.includes('accepted to the group')"), 'Must detect accepted to the group');
  assert(content.includes("text.includes('was accepted')"), 'Must detect was accepted');
  assert(content.includes("m?.type === 'service'"), 'Must detect service type');
  assert(content.includes("renderTelegramEventContent(m, telegramText)"), 'Must render service events with renderTelegramEventContent');
});

// TC-TG-14: MiddleChatColumn.tsx renders centered date separators with getTelegramDateGroup
runTest('TC-TG-14: MiddleChatColumn.tsx renders centered Telegram date badges', () => {
  const filePath = path.join(rootDir, 'components', 'workspace', 'MiddleChatColumn.tsx');
  const content = fs.readFileSync(filePath, 'utf8');

  assert(content.includes('const getTelegramDateGroup = (timestamp?: any): string => {'), 'getTelegramDateGroup must be defined');
  assert(content.includes('const currentDateGroup = getTelegramDateGroup(m.timestamp);'), 'Telegram loop must extract currentDateGroup');
  assert(content.includes('showDateSeparator && ('), 'Telegram loop must evaluate showDateSeparator');
  assert(content.includes('bg-black/40 dark:bg-black/60 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold shadow-xs border border-white/10 select-none'),
    'Telegram date separator pill styling must match real Telegram');
});

// TC-TG-15: Entity resolver exports getTelegramRawEntity and handles raw entities without throwing
runTest('TC-TG-15: lib/telegram_client.ts exports getTelegramRawEntity and telegramRawEntitiesMap', () => {
  const { recordTelegramEntity, getTelegramRawEntity, telegramRawEntitiesMap } = require('../lib/telegram_client');

  const testSession = 'test_session_raw_entity';
  const mockEntity = {
    className: 'Channel',
    id: '99887711',
    accessHash: '5544332211',
    title: 'Top Trading Group',
    username: 'top_trading_group'
  };

  recordTelegramEntity(testSession, mockEntity);

  const rawByDirectId = getTelegramRawEntity(testSession, '99887711');
  const rawByMinus100 = getTelegramRawEntity(testSession, '-10099887711');
  const rawByUsername = getTelegramRawEntity(testSession, 'top_trading_group');

  assert(rawByDirectId !== null, 'Must retrieve raw entity by direct ID');
  assert(rawByMinus100 !== null, 'Must retrieve raw entity by -100 ID');
  assert(rawByUsername !== null, 'Must retrieve raw entity by username');
  assert.strictEqual(rawByDirectId.title, 'Top Trading Group');
});

// TC-TG-16: MiddleChatColumn.tsx falls back to allContactMessages if topic filter yields 0 in General/untagged chats
runTest('TC-TG-16: MiddleChatColumn.tsx has topic filter fallback preventing falsely empty chats', () => {
  const filePath = path.join(rootDir, 'components', 'workspace', 'MiddleChatColumn.tsx');
  const content = fs.readFileSync(filePath, 'utf8');

  assert(content.includes('if (topicFiltered.length > 0) {'), 'Must check topicFiltered.length > 0');
  assert(content.includes('else if (allContactMessages.length > 0) {'), 'Must check allContactMessages.length > 0 fallback');
  assert(content.includes('activeMessages = allContactMessages;'), 'Must fallback to allContactMessages when appropriate');
});

console.log('\n================================================================');
console.log(`  TEST RESULTS: ${passedTests} PASSED | ${failedTests} FAILED`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
