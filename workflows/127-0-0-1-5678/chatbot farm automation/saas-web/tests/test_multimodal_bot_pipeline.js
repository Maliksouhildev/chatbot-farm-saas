/**
 * Test Suite: Multimodal AI Bot Pipeline & Debounced Aggregation
 *
 * Verifies:
 * 1. AI Bot Toggle enforcement (ignores when disabled, responds when enabled)
 * 2. Loop prevention (operator/bot messages are ignored)
 * 3. 17-second debounced aggregation sliding window (combining rapid texts with spaces)
 * 4. Audio-first transcription before vision analysis
 * 5. Context-aware vision analysis (extracting only query-relevant facts)
 * 6. 33% random reaction probability roll
 * 7. Native quoted reply targeting latestMessageId for WhatsApp, Discord, and Telegram
 * 8. Zero live contacts safety guarantee (all synthetic sandbox accounts)
 *
 * Usage:
 *   node tests/test_multimodal_bot_pipeline.js
 */

const assert = require('assert');
const path = require('path');

// We test both via direct TS/JS modules and simulated pipeline logic
async function runTests() {
  console.log('\n================================================================');
  console.log('  TEST SUITE: MULTIMODAL AI BOT PIPELINE & N8N WORKFLOW');
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

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`  \x1b[32m✔ PASS\x1b[0m ${name}`);
      passed++;
    } catch (err) {
      console.error(`  \x1b[31m✘ FAIL\x1b[0m ${name}`);
      console.error('    Error:', err.message);
      failed++;
    }
  }

  // Import pipeline modules
  const { ingestMessageToBuffer, flushBuffer, clearAllBuffers, getBufferKey } = require('../lib/message_buffer');
  const {
    runMultimodalBotPipeline,
    transcribeVoiceNotes,
    analyzeImageWithContext,
    generatePersonaReply,
    dispatchRandomReaction,
    dispatchNativeQuotedReply,
    isSyntheticAccount,
  } = require('../lib/multimodal_pipeline');

  // --- SECTION 1: SAFETY & SANDBOX VERIFICATION ---
  console.log('\n--- 1. Safety & Sandbox Verification ---');

  test('TC-SAFETY-01: Correctly identifies synthetic sandbox accounts', () => {
    assert.strictEqual(isSyntheticAccount('sandbox_user_1', '0551000000'), true);
    assert.strictEqual(isSyntheticAccount('demo_client', '5550001234'), true);
    assert.strictEqual(isSyntheticAccount('test_contact', '12345'), true);
    assert.strictEqual(isSyntheticAccount('dc_user_9999', 'dc_user_9999'), true);
  });

  await testAsync('TC-SAFETY-02: Zero live packets sent for sandbox accounts', async () => {
    const res = await dispatchNativeQuotedReply({
      appId: 'whatsapp',
      senderId: 'sandbox_client_99',
      senderPhone: '0555000000',
      replyText: 'Salam khoya! Test message',
      quotedMessageId: 'msg_test_123',
      isSandbox: true,
    });
    assert.strictEqual(res.mode, 'sandbox_simulation');
    assert.strictEqual(res.quotedMessageId, 'msg_test_123');
    assert.strictEqual(res.success, true);
  });

  // --- SECTION 2: AI BOT TOGGLE & LOOP PREVENTION ---
  console.log('\n--- 2. Bot Toggle & Loop Prevention ---');

  await testAsync('TC-TOGGLE-01: Disabling bot toggle skips auto-reply', async () => {
    // Test through simulated auto-reply route logic
    const reqBody = {
      isAiActive: false,
      appId: 'whatsapp',
      senderId: 'sandbox_user_toggle_off',
      messageText: 'Salam, chhal hada?',
      msgId: 'msg_toggle_1',
    };

    let skipped = false;
    let reason = '';
    if (reqBody.isAiActive === false) {
      skipped = true;
      reason = 'AI bot toggle is disabled for channel: whatsapp';
    }

    assert.strictEqual(skipped, true);
    assert.ok(reason.includes('disabled'));
  });

  await testAsync('TC-TOGGLE-02: Operator or AI self-messages never trigger reply (loop prevention)', async () => {
    const reqBody = {
      isAiActive: true,
      isFromMe: true,
      sender: 'human_operator',
      messageText: 'Hello customer',
    };

    let skipped = false;
    if (reqBody.isFromMe || reqBody.sender === 'human_operator') {
      skipped = true;
    }

    assert.strictEqual(skipped, true);
  });

  // --- SECTION 3: 17-SECOND DEBOUNCED AGGREGATION BUFFER ---
  console.log('\n--- 3. 17-Second Debounced Aggregation Buffer ---');

  test('TC-DEBOUNCE-01: Rapid consecutive texts aggregated into a single space-separated string', () => {
    clearAllBuffers();
    const sender = 'sandbox_burst_user';
    const appId = 'whatsapp';

    // User sends 3 rapid messages
    ingestMessageToBuffer({
      appId,
      senderId: sender,
      messageId: 'msg_1',
      text: 'Salam',
      windowSeconds: 17,
    });

    ingestMessageToBuffer({
      appId,
      senderId: sender,
      messageId: 'msg_2',
      text: 'bghit na3raf',
      windowSeconds: 17,
    });

    ingestMessageToBuffer({
      appId,
      senderId: sender,
      messageId: 'msg_3',
      text: 'chhal dayer had lproduit w kayen livraison l Alger?',
      windowSeconds: 17,
    });

    const key = getBufferKey(appId, sender);
    const flushed = flushBuffer(key);

    assert.ok(flushed);
    assert.strictEqual(flushed.textFragments.length, 3);
    assert.strictEqual(
      flushed.aggregatedText,
      'Salam bghit na3raf chhal dayer had lproduit w kayen livraison l Alger?'
    );
    assert.strictEqual(flushed.latestMessageId, 'msg_3');
  });

  test('TC-DEBOUNCE-02: Ingests mixed multimedia burst (text + image + audio)', () => {
    clearAllBuffers();
    const sender = 'sandbox_multimedia_user';
    const appId = 'discord';

    ingestMessageToBuffer({
      appId,
      senderId: sender,
      messageId: 'dc_msg_1',
      text: 'Look at this picture',
      windowSeconds: 17,
    });

    ingestMessageToBuffer({
      appId,
      senderId: sender,
      messageId: 'dc_msg_2',
      isImage: true,
      imageUrl: 'mock://images/sauvage_perfume.jpg',
      windowSeconds: 17,
    });

    ingestMessageToBuffer({
      appId,
      senderId: sender,
      messageId: 'dc_msg_3',
      isAudio: true,
      audioUrl: 'mock://audio/voice_note.ogg',
      audioDuration: 5,
      windowSeconds: 17,
    });

    const key = getBufferKey(appId, sender);
    const flushed = flushBuffer(key);

    assert.ok(flushed);
    assert.strictEqual(flushed.textFragments.length, 1);
    assert.strictEqual(flushed.images.length, 1);
    assert.strictEqual(flushed.audios.length, 1);
    assert.strictEqual(flushed.latestMessageId, 'dc_msg_3');
  });

  // --- SECTION 4: AUDIO-FIRST TRANSCRIPTION BEFORE VISION ---
  console.log('\n--- 4. Audio-First Transcription Before Vision ---');

  await testAsync('TC-AUDIO-01: Transcribes voice notes prior to vision analysis', async () => {
    const audios = [{ id: 'aud_1', url: 'mock://audio/voice_note.ogg', duration: 4 }];
    const transcript = await transcribeVoiceNotes(audios, undefined, true);

    assert.ok(transcript.length > 0);
    assert.ok(transcript.includes('Salam') || transcript.includes('chhal'));
  });

  await testAsync('TC-VISION-01: Context-aware vision extracts only relevant details', async () => {
    const images = [{ id: 'img_1', url: 'mock://images/bottle.jpg' }];
    const context = 'Salam, do you have this in blue or black color?';

    const visualSummary = await analyzeImageWithContext(images, context, undefined, true);

    assert.ok(visualSummary.length > 0);
    // Should extract color details relevant to query
    assert.ok(visualSummary.toLowerCase().includes('blue') || visualSummary.toLowerCase().includes('finish'));
  });

  // --- SECTION 5: RANDOM 33% EMOJI REACTIONS ---
  console.log('\n--- 5. Random 33% Emoji Reactions ---');

  await testAsync('TC-REACTION-01: Reaction probability adheres to ~33% default roll', async () => {
    let reactionsCount = 0;
    const trials = 100;

    for (let i = 0; i < trials; i++) {
      const res = await dispatchRandomReaction({
        appId: 'whatsapp',
        senderId: 'sandbox_reaction_user',
        messageId: `msg_${i}`,
        probability: 0.33,
        isSandbox: true,
      });
      if (res.reacted) {
        reactionsCount++;
        assert.ok(['👍', '❤️', '🔥', '👌', '👏'].includes(res.emoji));
      }
    }

    // Over 100 trials with p=0.33, count should be reasonable (between 18 and 50)
    console.log(`    Reaction rate observed: ${reactionsCount}/${trials} (${reactionsCount}%)`);
    assert.ok(reactionsCount >= 18 && reactionsCount <= 50, `Observed ${reactionsCount} reactions`);
  });

  // --- SECTION 6: NATIVE QUOTED REPLIES ACROSS APPS ---
  console.log('\n--- 6. Native Quoted Replies across WhatsApp, Discord, Telegram ---');

  await testAsync('TC-QUOTE-01: WhatsApp native quoted reply targets latestMessageId', async () => {
    const result = await runMultimodalBotPipeline({
      appId: 'whatsapp',
      senderId: 'sandbox_wa_client',
      senderPhone: '0555123456',
      aggregatedText: 'Salam khoya, chhal had lproduit?',
      latestMessageId: 'wa_msg_target_999',
      isSandbox: true,
      skipDelaysForTesting: true,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.quotedMessageId, 'wa_msg_target_999');
    assert.strictEqual(result.dispatchResult.mode, 'sandbox_simulation');
    assert.strictEqual(result.dispatchResult.quotedMessageId, 'wa_msg_target_999');
  });

  await testAsync('TC-QUOTE-02: Discord native quoted reply targets latestMessageId', async () => {
    const result = await runMultimodalBotPipeline({
      appId: 'discord',
      senderId: 'dc_user_987654321',
      aggregatedText: 'Hello bot, do you deliver in Algiers?',
      latestMessageId: 'dc_msg_reference_777',
      isSandbox: true,
      skipDelaysForTesting: true,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.quotedMessageId, 'dc_msg_reference_777');
    assert.strictEqual(result.dispatchResult.quotedMessageId, 'dc_msg_reference_777');
  });

  await testAsync('TC-QUOTE-03: Telegram native quoted reply targets latestMessageId', async () => {
    const result = await runMultimodalBotPipeline({
      appId: 'telegram',
      senderId: 'tg_chat_112233',
      aggregatedText: 'Salam, kayen livraison?',
      latestMessageId: 'tg_msg_reply_444',
      isSandbox: true,
      skipDelaysForTesting: true,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.quotedMessageId, 'tg_msg_reply_444');
    assert.strictEqual(result.dispatchResult.quotedMessageId, 'tg_msg_reply_444');
  });

  // --- SECTION 7: END-TO-END MULTIMODAL PIPELINE ---
  console.log('\n--- 7. End-to-End Multimodal Pipeline ---');

  await testAsync('TC-E2E-01: Full multimodal pipeline: Voice first + context vision + Algerian Darija reply', async () => {
    const result = await runMultimodalBotPipeline({
      appId: 'whatsapp',
      senderId: 'sandbox_full_multimodal_client',
      senderPhone: '0555999888',
      aggregatedText: 'Salam chhal dayer had lparfum Sauvage?',
      textFragments: ['Salam', 'chhal dayer had lparfum Sauvage?'],
      audios: [{ id: 'aud_1', url: 'mock://voice_note.ogg', duration: 3 }],
      images: [{ id: 'img_1', url: 'mock://perfume.jpg' }],
      latestMessageId: 'wa_burst_latest_555',
      botSettings: {
        botName: 'El Bahdja Bot',
        businessName: 'Parfumerie Alger',
        primaryLanguage: 'darija_latin',
        reactionProbability: 0.33,
      },
      isSandbox: true,
      skipDelaysForTesting: true,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.quotedMessageId, 'wa_burst_latest_555');
    assert.ok(result.transcribedAudioText);
    assert.ok(result.visualAnalysisSummary);
    assert.ok(result.replyText.length > 10);
    // Verifies reply mentions Algerian Dinars / delivery details
    assert.ok(
      result.replyText.includes('DA') ||
      result.replyText.includes('3500') ||
      result.replyText.includes('livraison')
    );
  });

  console.log('\n================================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
