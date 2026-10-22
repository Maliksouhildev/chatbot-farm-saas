'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, RefreshCw, CheckCircle2, AlertCircle, Wifi, QrCode } from 'lucide-react';

interface QRCodeCardProps {
    botId: string;
    instanceName: string;
    initialStatus?: 'connected' | 'qr_ready' | 'disconnected';
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
    botId,
    instanceName,
    initialStatus = 'disconnected',
}) => {
    const [status, setStatus] = useState(initialStatus);
    const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchQRCode = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/channels/whatsapp/qr?instance=${instanceName}`);
            const data = await res.json();
            if (data.base64) {
                setQrCodeBase64(data.base64);
                setStatus('qr_ready');
            } else if (data.status === 'open') {
                setStatus('connected');
            }
        } catch (err) {
            console.error('Failed to load QR code:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status !== 'connected') {
            fetchQRCode();
            const interval = setInterval(async () => {
                const res = await fetch(`/api/channels/whatsapp/status?instance=${instanceName}`);
                const stateData = await res.json();
                if (stateData.state === 'open') {
                    setStatus('connected');
                    setQrCodeBase64(null);
                    clearInterval(interval);
                }
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [instanceName, status]);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">WhatsApp Connection</h3>
                        <p className="text-xs text-gray-500">Instance: {instanceName}</p>
                    </div>
                </div>
                <div>
                    {status === 'connected' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <Wifi className="w-3.5 h-3.5 mr-1" /> Scan Required
                        </span>
                    )}
                </div>
            </div>

            {status === 'connected' ? (
                <div className="py-8 text-center bg-green-50/50 rounded-xl border border-green-100 mb-4">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <h4 className="font-medium text-green-900">Your WhatsApp is Linked!</h4>
                    <p className="text-xs text-green-700 max-w-xs mx-auto mt-1">
                        Your chatbot is live and ready to answer customer inquiries in Algerian Darija 24/7.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 mb-4 min-h-[260px]">
                    {loading ? (
                        <div className="flex flex-col items-center">
                            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                            <p className="text-xs text-gray-500">Generating secure pairing QR...</p>
                        </div>
                    ) : qrCodeBase64 ? (
                        <div className="text-center">
                            <img
                                src={qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`}
                                alt="WhatsApp QR Code"
                                className="w-52 h-52 mx-auto rounded-lg shadow-sm border border-gray-200"
                            />
                            <p className="text-xs text-gray-500 mt-3 font-medium">
                                Open WhatsApp on your phone &gt; Linked Devices &gt; Scan this QR
                            </p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">Click below to generate a new QR code</p>
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center space-x-2">
                <button
                    onClick={fetchQRCode}
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 shadow-sm text-xs font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh QR
                </button>
            </div>
        </div>
    );
};
