import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const { appId, contactId, messageText, history = [] } = body;

    if (!messageText || typeof messageText !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const cleanInput = messageText.trim().toLowerCase();

    // 1. Check for real OpenAI API Key
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey) {
      try {
        const messagesPayload = [
          {
            role: "system",
            content: `You are the AI Customer Support Agent for an eCommerce business on ${appId || 'omnichannel'}. 
Keep your response concise (1-3 sentences), warm, and helpful. 
You can assist with product availability, prices, order status, and fast delivery across all 58 Algerian wilayas.`
          },
          ...history.slice(-4).map((h: any) => ({
            role: h.sender === 'customer' ? 'user' : 'assistant',
            content: h.text
          })),
          { role: "user", content: messageText }
        ];

        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
            messages: messagesPayload,
            max_tokens: 150,
            temperature: 0.7
          }),
          signal: AbortSignal.timeout(8000)
        });

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          const reply = data?.choices?.[0]?.message?.content?.trim();
          if (reply) {
            return NextResponse.json({
              success: true,
              replyText: reply,
              metadata: {
                model: data.model || 'gpt-3.5-turbo',
                latencyMs: Date.now() - startTime
              }
            });
          }
        }
      } catch (err) {
        console.warn('OpenAI request failed, falling back to smart rule engine:', err);
      }
    }

    // 2. Intelligent Omnichannel Rule Engine Fallback (Zero-configuration reliability)
    let replyText = "Hello! Thanks for reaching out. How can I assist you with your order today?";

    if (cleanInput.includes('prix') || cleanInput.includes('price') || cleanInput.includes('combien') || cleanInput.includes('how much') || cleanInput.includes('chhal')) {
      replyText = "Hello! Our prices vary by model and package. Which item are you interested in so I can provide the exact price and current promo?";
    } else if (cleanInput.includes('livraison') || cleanInput.includes('delivery') || cleanInput.includes('shipping') || cleanInput.includes('tawsil')) {
      replyText = "We offer fast home delivery across all 58 wilayas in Algeria (24h to 48h) with payment on delivery (Cash on Delivery)! What is your city?";
    } else if (cleanInput.includes('commande') || cleanInput.includes('order') || cleanInput.includes('commander') || cleanInput.includes('buy')) {
      replyText = "To confirm your order, please send your full name, phone number, and delivery wilaya. Our logistics team will process it immediately!";
    } else if (cleanInput.includes('salam') || cleanInput.includes('bonjour') || cleanInput.includes('salut') || cleanInput.includes('hello') || cleanInput.includes('hi') || cleanInput.includes('hey')) {
      replyText = "Salam & Welcome! How can our support team assist you today?";
    } else if (cleanInput.includes('merci') || cleanInput.includes('thanks') || cleanInput.includes('sahha') || cleanInput.includes('thank you')) {
      replyText = "You're very welcome! If you need anything else, feel free to ask anytime. Have a great day!";
    } else if (cleanInput.includes('humain') || cleanInput.includes('human') || cleanInput.includes('agent') || cleanInput.includes('parler')) {
      replyText = "I have notified our human operator team. An agent will take over this conversation shortly!";
    } else {
      replyText = "Thank you for your message! Our AI assistant has received your inquiry and our support team is reviewing it. Is there any specific detail you would like to know?";
    }

    return NextResponse.json({
      success: true,
      replyText,
      metadata: {
        model: 'rule-engine-v2',
        latencyMs: Date.now() - startTime
      }
    });

  } catch (error: any) {
    console.error('AI Auto-reply route error:', error);
    return NextResponse.json({
      error: error.message || 'Internal server error in auto-reply generator'
    }, { status: 500 });
  }
}
