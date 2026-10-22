import { NextResponse } from 'next/server';
import { ingestMessageToBuffer, flushBuffer, DEFAULT_DEBOUNCE_SECONDS } from '@/lib/message_buffer';
import { runMultimodalBotPipeline, isSyntheticAccount } from '@/lib/multimodal_pipeline';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const {
      action = 'auto',
      appId = 'whatsapp',
      channelType = appId,
      senderId = body.contactId || body.remoteJid || body.chatId || 'sandbox_client_1',
      senderName = body.contactName || body.pushName || 'Client',
      senderPhone = body.phone || body.customerPhone || senderId,
      messageId = body.msgId || body.messageId || `msg_${Date.now()}`,
      messageText = body.text || body.content || '',
      isAudio = Boolean(body.isAudio || body.audioUrl),
      audioUrl = body.audioUrl || '',
      audioDuration = body.audioDuration,
      isImage = Boolean(body.isImage || body.imageUrl),
      imageUrl = body.imageUrl || '',
      isFromMe = Boolean(body.isFromMe || body.fromMe || body.sender === 'human_operator' || body.sender === 'ai'),
      isAiActive = body.isAiActive ?? body.enabled ?? true,
      botSettings = body.botSettings,
      ragContext = body.ragContext,
      websiteUrl = body.websiteUrl,
      windowSeconds = body.windowSeconds || DEFAULT_DEBOUNCE_SECONDS,
      skipDelaysForTesting = Boolean(body.skipDelaysForTesting),
    } = body;

    // 1. Guard: If sender is the owner/operator or AI itself, DO NOT reply (prevent loops)
    if (isFromMe) {
      return NextResponse.json({
        skipped: true,
        reason: 'Message sent by human operator or bot itself (loop prevention)',
      });
    }

    // 2. Guard: If Bot toggle is disabled for this specific channel/app, DO NOT reply
    if (isAiActive === false) {
      return NextResponse.json({
        skipped: true,
        reason: `AI bot toggle is disabled for channel: ${appId}`,
      });
    }

    // 3. Action Mode: Flush buffer immediately
    if (action === 'flush') {
      const bufferKey = body.bufferKey || `${appId.toLowerCase()}:${String(senderId).toLowerCase()}`;
      const flushed = flushBuffer(bufferKey);
      if (!flushed) {
        return NextResponse.json({ error: 'No active buffer found for key', bufferKey }, { status: 404 });
      }

      const pipelineResult = await runMultimodalBotPipeline({
        appId: flushed.appId,
        senderId: flushed.senderId,
        senderName: flushed.senderName,
        senderPhone: flushed.senderPhone,
        channelType: flushed.channelType,
        topicId: flushed.topicId,
        guildId: flushed.guildId,
        botId: flushed.botId,
        aggregatedText: flushed.aggregatedText,
        textFragments: flushed.textFragments,
        audios: flushed.audios,
        images: flushed.images,
        latestMessageId: flushed.latestMessageId,
        botSettings,
        ragContext,
        websiteUrl,
        skipDelaysForTesting,
      });

      return NextResponse.json({
        success: true,
        flushed: true,
        bufferKey,
        totalItems: flushed.totalItems,
        result: pipelineResult,
      });
    }

    // 4. Action Mode: Ingest into sliding-window debounce buffer (17-second window)
    if (action === 'ingest') {
      const { bufferKey, itemCount, isNewSession } = ingestMessageToBuffer({
        appId,
        senderId,
        senderName,
        senderPhone,
        channelType,
        topicId: body.topicId,
        guildId: body.guildId,
        botId: body.botId,
        messageId,
        text: messageText,
        isAudio,
        audioUrl,
        audioDuration,
        isImage,
        imageUrl,
        windowSeconds,
        onExpire: async (buffer) => {
          // When 17-second window expires without new messages, execute the multimodal pipeline
          const textFragments: string[] = [];
          const audios: Array<{ id: string; url: string; duration?: number }> = [];
          const images: Array<{ id: string; url: string }> = [];
          let latestMsgId = '';

          for (const item of buffer.items) {
            latestMsgId = item.id;
            if (item.type === 'text' && item.text) textFragments.push(item.text);
            else if (item.type === 'audio' && item.url) audios.push({ id: item.id, url: item.url, duration: item.duration });
            else if (item.type === 'image' && item.url) images.push({ id: item.id, url: item.url });
          }

          await runMultimodalBotPipeline({
            appId: buffer.appId,
            senderId: buffer.senderId,
            senderName: buffer.senderName,
            senderPhone: buffer.senderPhone,
            channelType: buffer.channelType,
            topicId: buffer.topicId,
            guildId: buffer.guildId,
            botId: buffer.botId,
            aggregatedText: textFragments.join(' ').trim(),
            textFragments,
            audios,
            images,
            latestMessageId: latestMsgId,
            botSettings,
            ragContext,
            websiteUrl,
            skipDelaysForTesting,
          });
        },
      });

      return NextResponse.json({
        success: true,
        buffered: true,
        bufferKey,
        itemCount,
        isNewSession,
        slidingWindowSeconds: windowSeconds,
      });
    }

    // 5. Default/Direct execution: Process message through multimodal pipeline immediately
    const textFragments = Array.isArray(body.textFragments)
      ? body.textFragments
      : messageText ? [messageText] : [];

    const audios = Array.isArray(body.audios)
      ? body.audios
      : (isAudio && audioUrl ? [{ id: messageId, url: audioUrl, duration: audioDuration }] : []);

    const images = Array.isArray(body.images)
      ? body.images
      : (isImage && imageUrl ? [{ id: messageId, url: imageUrl }] : []);

    const pipelineResult = await runMultimodalBotPipeline({
      appId,
      senderId,
      senderName,
      senderPhone,
      channelType,
      topicId: body.topicId,
      guildId: body.guildId,
      botId: body.botId,
      aggregatedText: textFragments.join(' ').trim(),
      textFragments,
      audios,
      images,
      latestMessageId: messageId,
      botSettings,
      ragContext,
      websiteUrl,
      skipDelaysForTesting,
    });

    return NextResponse.json({
      success: true,
      replyText: pipelineResult.replyText,
      quotedMessageId: pipelineResult.quotedMessageId,
      reactionDispatched: pipelineResult.reactionDispatched,
      reactionEmoji: pipelineResult.reactionEmoji,
      transcribedAudioText: pipelineResult.transcribedAudioText,
      visualAnalysisSummary: pipelineResult.visualAnalysisSummary,
      metadata: {
        ...pipelineResult.metadata,
        totalExecutionMs: Date.now() - startTime,
      },
    });

  } catch (error: any) {
    console.error('AI Auto-reply route error:', error);
    return NextResponse.json({
      error: error.message || 'Internal server error in auto-reply generator',
    }, { status: 500 });
  }
}
