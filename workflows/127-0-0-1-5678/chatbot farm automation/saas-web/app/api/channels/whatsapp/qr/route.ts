import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const evolutionUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
  const apiKey = process.env.EVOLUTION_API_KEY || 'farm_evolution_master_secret_2026';

  try {
    const { searchParams } = new URL(req.url);
    const instance = searchParams.get('instance') || 'default_instance';
    const number = searchParams.get('number');

    // 1. Check if Evolution API engine is alive & instance connection state
    let isEngineReachable = false;
    try {
      const stateRes = await fetch(`${evolutionUrl}/instance/connectionState/${instance}`, {
        headers: { apikey: apiKey },
        signal: AbortSignal.timeout(3500)
      });
      isEngineReachable = true;
      if (stateRes.ok) {
        const stateData = await stateRes.json();
        if (stateData?.instance?.state === 'open') {
          return NextResponse.json({
            status: 'connected',
            qrCodeBase64: null,
            rawCode: null,
            pairingCode: null,
            instance
          });
        }
      }
    } catch (e: any) {
      // Gateway is unreachable
      return NextResponse.json({
        status: 'engine_offline',
        error: 'WhatsApp Gateway container (Evolution API on port 8080) is unreachable. Docker Desktop must be running.',
        evolutionUrl
      }, { status: 503 });
    }

    // 2. Fetch fresh QR code or pairing code
    let connectUrl = `${evolutionUrl}/instance/connect/${instance}`;
    if (number) {
      const cleanNum = number.replace(/\D/g, '');
      if (cleanNum) {
        connectUrl += `?number=${encodeURIComponent(cleanNum)}`;
      }
    }

    let qrRes = await fetch(connectUrl, {
      headers: { apikey: apiKey },
      signal: AbortSignal.timeout(6000)
    });

    // If 404 (instance not found in Evolution), auto-create it and retry
    if (qrRes.status === 404) {
      try {
        await fetch(`${evolutionUrl}/instance/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: apiKey
          },
          body: JSON.stringify({
            instanceName: instance,
            integration: 'WHATSAPP-BAILEYS',
            qrcode: true
          }),
          signal: AbortSignal.timeout(6000)
        });

        qrRes = await fetch(connectUrl, {
          headers: { apikey: apiKey },
          signal: AbortSignal.timeout(6000)
        });
      } catch {}
    }

    if (!qrRes.ok) {
      return NextResponse.json({
        status: 'disconnected',
        error: `Evolution API returned HTTP ${qrRes.status}`
      }, { status: 502 });
    }

    const qrData = await qrRes.json();
    const hasQr = Boolean(qrData?.base64 || qrData?.code);

    return NextResponse.json({
      status: hasQr ? 'qr_ready' : 'connecting',
      qrCodeBase64: qrData?.base64 || null,
      rawCode: qrData?.code || null,
      pairingCode: qrData?.pairingCode || null,
      count: qrData?.count || 1,
      instance
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'engine_offline',
      error: error.message || 'Error communicating with WhatsApp engine'
    }, { status: 500 });
  }
}
