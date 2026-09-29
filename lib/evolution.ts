/**
 * Evolution API v2 Integration
 * Manages multi-tenant WhatsApp instances, QR Code pairing, and webhook routing to n8n.
 */

export interface InstanceConfig {
    instanceName: string;
    webhookUrl: string;
}

export class EvolutionService {
    private apiUrl: string;
    private apiKey: string;

    constructor() {
        this.apiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
        this.apiKey = process.env.EVOLUTION_API_KEY || '';
    }

    private getHeaders() {
        return {
            'apikey': this.apiKey,
            'Content-Type': 'application/json',
        };
    }

    /**
     * Create a new isolated WhatsApp instance for a bot tenant
     */
    async createInstance(instanceName: string, webhookUrl: string) {
        const response = await fetch(`${this.apiUrl}/instance/create`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                instanceName: instanceName,
                token: '',
                qrcode: true,
                integration: 'WHATSAPP-BAILEYS',
                webhook: webhookUrl,
                webhook_by_events: false,
                events: [
                    'MESSAGES_UPSERT',
                    'CONNECTION_UPDATE',
                    'QRCODE_UPDATED'
                ]
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`Failed to create Evolution API instance: ${JSON.stringify(error)}`);
        }

        return await response.json();
    }

    /**
     * Fetch the live base64 QR code for WhatsApp Web pairing
     */
    async getQRCode(instanceName: string): Promise<{ base64?: string; pairingCode?: string; count?: number }> {
        const response = await fetch(`${this.apiUrl}/instance/connect/${instanceName}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch QR code for instance ${instanceName}`);
        }

        const data = await response.json();
        return {
            base64: data.base64 || data.qrcode?.base64,
            pairingCode: data.pairingCode,
            count: data.count,
        };
    }

    /**
     * Check current connection status of WhatsApp instance
     */
    async getConnectionState(instanceName: string): Promise<'open' | 'close' | 'connecting'> {
        const response = await fetch(`${this.apiUrl}/instance/connectionState/${instanceName}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            return 'close';
        }

        const data = await response.json();
        return data.instance?.state || 'close';
    }

    /**
     * Logout and delete instance when client cancels
     */
    async deleteInstance(instanceName: string) {
        await fetch(`${this.apiUrl}/instance/delete/${instanceName}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
    }
}
