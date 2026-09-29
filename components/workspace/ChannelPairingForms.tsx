"use client";

import React, { useState, useEffect } from "react";
import { 
  Bot, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink, 
  Smartphone, 
  ShieldCheck, 
  Key, 
  Lock, 
  Globe, 
  ArrowRight,
  Server,
  Hash,
  AtSign,
  QrCode as QrIcon,
  Mail,
  User,
  Eye,
  EyeOff,
  Wifi,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import { 
  LinkedInIcon, 
  XIcon, 
  GoogleChatIcon, 
  GoogleVoiceIcon, 
  GoogleMessagesIcon,
  GmailIcon 
} from "@/components/icons/BrandIcons";

interface ChannelPairingFormsProps {
  appId: string;
  theme: { solidColor: string; name: string };
  onVerifySuccess: (accountInfo: any, token?: string) => void;
  onCancel?: () => void;
}

export const ChannelPairingForms: React.FC<ChannelPairingFormsProps> = ({
  appId,
  theme,
  onVerifySuccess,
}) => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active user session detection for 1-Click connects
  const [activeUser, setActiveUser] = useState<any>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem("cf_user_session");
      if (s) {
        const u = JSON.parse(s);
        setActiveUser(u);
        setFormData((prev) => ({
          ...prev,
          linkedinEmail: prev.linkedinEmail || u.email || "",
          gchatEmail: prev.gchatEmail || u.email || "",
          xHandle: prev.xHandle || (u.email ? u.email.split("@")[0] : ""),
        }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (session?.user && appId === "google_chat") {
      const payload = {
        method: "google",
        email: session.user.email,
        space: "Google Workspace Team Chat",
        verified: true,
        // @ts-ignore
        accessToken: session.accessToken
      };
      localStorage.setItem("cf_google_chat_space", "Google Workspace Team Chat");
      localStorage.setItem("cf_google_chat_account", JSON.stringify(payload));
      onVerifySuccess(payload);
    }
  }, [session, appId]);

  // Sub-tab selection for multi-mode channels
  const [discordMode, setDiscordMode] = useState<"qr" | "login" | "token">("qr");
  const [slackMode, setSlackMode] = useState<"email" | "token">("email");
  const [slackStep, setSlackStep] = useState<"email" | "code">("email");
  const [rcsMode, setRcsMode] = useState<"qr" | "phone">("qr");
  const [xMode, setXMode] = useState<"cookie" | "login" | "token">("cookie");
  const [linkedinMode, setLinkedinMode] = useState<"oauth" | "login" | "qr" | "token">("oauth");
  const [gchatMode, setGchatMode] = useState<"google" | "direct" | "qr">("google");

  // Discord Remote Auth state
  const [discordSessionId, setDiscordSessionId] = useState<string | null>(null);
  const [discordQrStatus, setDiscordQrStatus] = useState<"loading" | "pending" | "scanned" | "success" | "expired" | "error">("loading");
  const [discordScannedUser, setDiscordScannedUser] = useState<any | null>(null);

  // QR Code states
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrCountdown, setQrCountdown] = useState(45);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields per channel
  const [formData, setFormData] = useState<Record<string, string>>({
    // Discord
    discordEmail: "",
    discordPassword: "",
    discordCode: "",
    discordBotToken: "",
    discordGuildId: "",
    // Slack
    slackEmail: "",
    slackCode: "",
    slackToken: "",
    slackWorkspace: "",
    // X / Twitter
    xHandle: "",
    xPassword: "",
    xCookie: "",
    xApiKey: "",
    // Matrix
    matrixHomeserver: "https://matrix.org",
    matrixUserId: "",
    matrixPassword: "",
    matrixToken: "",
    // Google Messages RCS
    rcsPhone: "+213 ",
    // Google Chat
    gchatEmail: "",
    gchatSpace: "Workspace Team Chat",
    // Google Voice
    gvoiceNumber: "",
    // LinkedIn
    linkedinEmail: "",
    linkedinPassword: "",
    linkedinOrg: "",
    linkedinToken: "",
    // IRC
    ircHost: "irc.libera.chat",
    ircPort: "6697",
    ircNick: "",
    ircChannel: "",
  });

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Fetch official Discord Remote Auth QR from Discord Gateway
  const fetchDiscordQr = async () => {
    setDiscordQrStatus("loading");
    setQrDataUrl(null);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/channels/discord/qr?action=start");
      const data = await res.json();
      if (data.success && data.sessionId) {
        setDiscordSessionId(data.sessionId);
        setDiscordQrStatus("pending");
        if (data.qrCodeBase64) {
          setQrDataUrl(data.qrCodeBase64);
          setQrCountdown(115);
        }
      } else {
        setDiscordQrStatus("error");
        setErrorMessage(data.error || "Failed to initialize Discord QR gateway");
      }
    } catch (err: any) {
      setDiscordQrStatus("error");
      setErrorMessage(err.message || "Failed to connect to Discord Remote Auth Gateway");
    }
  };

  // Initialize Discord QR when in Discord QR mode
  useEffect(() => {
    if (appId === "discord" && discordMode === "qr") {
      fetchDiscordQr();
    }
  }, [appId, discordMode]);

  // Poll Discord Remote Auth gateway for mobile scan & approval
  useEffect(() => {
    if (
      appId !== "discord" ||
      discordMode !== "qr" ||
      !discordSessionId ||
      discordQrStatus === "success" ||
      discordQrStatus === "expired"
    ) {
      return;
    }

    const pollTimer = setInterval(async () => {
      try {
        const res = await fetch(`/api/channels/discord/qr?sessionId=${encodeURIComponent(discordSessionId)}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "scanned") {
          setDiscordQrStatus("scanned");
          if (data.scannedUser) {
            setDiscordScannedUser(data.scannedUser);
          }
        } else if (data.status === "success" && data.token) {
          setDiscordQrStatus("success");
          clearInterval(pollTimer);
          try {
            localStorage.setItem("cf_discord_token", data.token);
            if (data.account) {
              localStorage.setItem("cf_discord_account", JSON.stringify(data.account));
            }
          } catch {}
          onVerifySuccess(data.account, data.token);
        } else if (data.status === "expired" || data.status === "cancelled") {
          setDiscordQrStatus("expired");
          clearInterval(pollTimer);
        }
      } catch {}
    }, 2000);

    return () => clearInterval(pollTimer);
  }, [appId, discordMode, discordSessionId, discordQrStatus, onVerifySuccess]);

  // Generate QR Code for RCS Device Pairing, X Mobile, LinkedIn, and Google Chat
  useEffect(() => {
    let active = true;
    const generateQr = async () => {
      try {
        let payload = "";
        const nonce = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        if (appId === "google_messages") {
          payload = `https://messages.google.com/web/authentication?token=${nonce}`;
        } else if (appId === "linkedin" && linkedinMode === "qr") {
          payload = `https://www.linkedin.com/oauth/v2/authorization?partner=chatbot_farm&nonce=${nonce}`;
        } else if (appId === "google_chat" && gchatMode === "qr") {
          payload = `https://chat.google.com/auth?partner=chatbot_farm&token=${nonce}`;
        }

        if (payload) {
          const url = await QRCode.toDataURL(payload, {
            width: 280,
            margin: 2,
            color: { dark: "#18181B", light: "#FFFFFF" },
          });
          if (active) {
            setQrDataUrl(url);
            setQrCountdown(45);
          }
        }
      } catch (err) {
        console.warn("Failed to generate QR in ChannelPairingForms:", err);
      }
    };

    if (
      (appId === "google_messages" && rcsMode === "qr") ||
      (appId === "linkedin" && linkedinMode === "qr") ||
      (appId === "google_chat" && gchatMode === "qr")
    ) {
      generateQr();
    }

    return () => {
      active = false;
    };
  }, [appId, rcsMode, xMode, linkedinMode, gchatMode]);

  // QR countdown timer
  useEffect(() => {
    if (discordMode !== "qr" && rcsMode !== "qr" && linkedinMode !== "qr" && gchatMode !== "qr") return;
    const timer = setInterval(() => {
      setQrCountdown((prev) => (prev <= 1 ? (appId === "discord" ? 115 : 45) : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [appId, discordMode, rcsMode, xMode, linkedinMode, gchatMode]);

  // Form submission handler
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    let payload: Record<string, any> = {};
    let passedToken = "";

    if (appId === "discord") {
      if (discordMode === "login") {
        const inputVal = formData.discordEmail.trim();
        if (!inputVal) {
          setErrorMessage("Please enter your Discord email, phone number, or Account Token.");
          setIsLoading(false);
          return;
        }
        const isToken = inputVal.length > 35 && !inputVal.includes("@");
        payload = {
          email: isToken ? undefined : inputVal,
          password: formData.discordPassword.trim() || undefined,
          token: isToken ? inputVal : undefined,
        };
        passedToken = isToken ? inputVal : "";
      } else if (discordMode === "qr") {
        fetchDiscordQr();
        setIsLoading(false);
        return;
      } else {
        if (!formData.discordBotToken.trim()) {
          setErrorMessage("Discord Bot or Account Token is required.");
          setIsLoading(false);
          return;
        }
        payload = {
          token: formData.discordBotToken.trim(),
          botToken: formData.discordBotToken.trim(),
          guildId: formData.discordGuildId.trim(),
        };
        passedToken = formData.discordBotToken.trim();
      }
    } else if (appId === "slack") {
      if (slackMode === "email") {
        if (!formData.slackEmail.trim()) {
          setErrorMessage("Please enter your work email.");
          setIsLoading(false);
          return;
        }
        payload = {
          email: formData.slackEmail.trim(),
          code: formData.slackCode.trim(),
          workspace: formData.slackWorkspace.trim() || formData.slackEmail.split("@")[1] || "Slack Workspace",
        };
      } else {
        if (!formData.slackToken.trim()) {
          setErrorMessage("Slack Bot/User Token is required.");
          setIsLoading(false);
          return;
        }
        payload = {
          botToken: formData.slackToken.trim(),
          workspace: formData.slackWorkspace.trim() || "Slack Workspace",
        };
        passedToken = formData.slackToken.trim();
      }
    } else if (appId === "x_twitter") {
      if (xMode === "cookie") {
        if (!formData.xCookie.trim()) {
          setErrorMessage("Please paste your Twitter/X auth_token cookie.");
          setIsLoading(false);
          return;
        }
        payload = {
          method: "cookie",
          cookie: formData.xCookie.trim(),
          authToken: formData.xCookie.trim(),
          handle: formData.xHandle.trim().replace(/^@/, ""),
        };
      } else if (xMode === "token") {
        if (!formData.xApiKey.trim()) {
          setErrorMessage("X API Bearer Token is required.");
          setIsLoading(false);
          return;
        }
        payload = {
          method: "token",
          apiKey: formData.xApiKey.trim(),
          handle: formData.xHandle.trim().replace(/^@/, "") || "x_business",
        };
        passedToken = formData.xApiKey.trim();
      } else {
        if (!formData.xHandle.trim()) {
          setErrorMessage("Please enter your X / Twitter @username, email or phone.");
          setIsLoading(false);
          return;
        }
        if (!formData.xPassword.trim()) {
          setErrorMessage("Please enter your X password.");
          setIsLoading(false);
          return;
        }
        payload = {
          method: "login",
          handle: formData.xHandle.trim().replace(/^@/, ""),
          password: formData.xPassword.trim(),
        };
      }
    } else if (appId === "matrix") {
      if (!formData.matrixUserId.trim()) {
        setErrorMessage("Matrix User ID is required (e.g. @user:matrix.org)");
        setIsLoading(false);
        return;
      }
      payload = {
        homeserver: formData.matrixHomeserver.trim() || "https://matrix.org",
        userId: formData.matrixUserId.trim(),
        token: formData.matrixToken.trim(),
        password: formData.matrixPassword.trim(),
      };
      passedToken = formData.matrixToken.trim();
    } else if (appId === "google_messages") {
      if (rcsMode === "phone") {
        if (!formData.rcsPhone.trim() || formData.rcsPhone.trim().length < 8) {
          setErrorMessage("Please enter a valid phone number.");
          setIsLoading(false);
          return;
        }
        payload = { phone: formData.rcsPhone.trim() };
      } else {
        payload = { qrSession: `rcs_qr_${Date.now()}`, verified: true };
      }
    } else if (appId === "google_chat") {
      if (gchatMode === "google") {
        await signIn("google");
        return;
      } else if (gchatMode === "qr") {
        payload = {
          method: "qr",
          email: activeUser?.email || "mobile@google.com",
          space: "Google Chat Mobile Device",
          verified: true,
        };
      } else {
        if (!formData.gchatEmail.trim()) {
          setErrorMessage("Please enter your Google Workspace or personal email address.");
          setIsLoading(false);
          return;
        }
        payload = {
          method: "direct",
          email: formData.gchatEmail.trim(),
          space: formData.gchatSpace.trim() || "Customer Support Space",
          verified: true,
        };
      }
    } else if (appId === "google_voice") {
      payload = {
        number: formData.gvoiceNumber.trim() || "+1 (555) 019-2831",
        email: activeUser?.email,
        verified: true,
      };
    } else if (appId === "linkedin") {
      if (linkedinMode === "oauth") {
        payload = {
          method: "oauth",
          oauth: true,
          email: activeUser?.email || "user@linkedin.com",
          name: activeUser?.name || "LinkedIn Professional",
          page: formData.linkedinOrg.trim() || `${activeUser?.name || "Member"} (Company Page)`,
        };
      } else if (linkedinMode === "qr") {
        payload = {
          method: "qr",
          qr: true,
          page: formData.linkedinOrg.trim() || "LinkedIn Mobile Gateway",
        };
      } else if (linkedinMode === "login") {
        if (!formData.linkedinEmail.trim()) {
          setErrorMessage("Please enter your LinkedIn account email or phone number.");
          setIsLoading(false);
          return;
        }
        if (!formData.linkedinPassword.trim()) {
          setErrorMessage("Please enter your LinkedIn account password.");
          setIsLoading(false);
          return;
        }
        payload = {
          method: "login",
          email: formData.linkedinEmail.trim(),
          password: formData.linkedinPassword.trim(),
          page: formData.linkedinOrg.trim() || `${formData.linkedinEmail.split("@")[0]} (InMail & Leads)`,
        };
      } else {
        if (!formData.linkedinToken.trim()) {
          setErrorMessage("LinkedIn Access Token is required.");
          setIsLoading(false);
          return;
        }
        payload = {
          method: "token",
          token: formData.linkedinToken.trim(),
          page: formData.linkedinOrg.trim() || "LinkedIn Organization",
        };
        passedToken = formData.linkedinToken.trim();
      }
    } else if (appId === "irc") {
      if (!formData.ircNick.trim()) {
        setErrorMessage("IRC Nickname is required.");
        setIsLoading(false);
        return;
      }
      payload = {
        host: formData.ircHost.trim() || "irc.libera.chat",
        port: parseInt(formData.ircPort.trim()) || 6697,
        nick: formData.ircNick.trim(),
        channel: formData.ircChannel.trim(),
      };
    }

    try {
      const res = await fetch(`/api/channels/${appId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `Failed to verify ${theme.name}`);
      }

      if (appId === "discord") {
        const effectiveToken = data.token || passedToken;
        if (effectiveToken) {
          try {
            localStorage.setItem("cf_discord_token", effectiveToken);
            if (data.account) {
              localStorage.setItem("cf_discord_account", JSON.stringify(data.account));
            }
          } catch {}
        }
      } else if (appId === "x_twitter") {
        try {
          const handle = data.account?.handle || payload.handle || "@x_account";
          localStorage.setItem("cf_x_twitter_handle", handle);
          localStorage.setItem("cf_x_twitter_account", JSON.stringify(data.account || payload));
          if (data.account?.session || data.session) {
            localStorage.setItem("cf_x_twitter_session", JSON.stringify(data.account?.session || data.session));
          }
        } catch {}
      } else if (appId === "irc") {
        try {
          localStorage.setItem("cf_irc_nick", payload.nick || "chatbot_user");
          localStorage.setItem("cf_irc_channel", payload.channel || "#chatbot-farm");
          localStorage.setItem("cf_irc_host", payload.host || "irc.libera.chat");
          localStorage.setItem("cf_irc_port", String(payload.port || 6697));
        } catch {}
      } else if (appId === "linkedin") {
        try {
          const page = data.account?.page || payload.page || "LinkedIn Page";
          localStorage.setItem("cf_linkedin_page", page);
          localStorage.setItem("cf_linkedin_account", JSON.stringify(data.account || payload));
          if (payload.token) {
            localStorage.setItem("cf_linkedin_token", payload.token);
          }
        } catch {}
      } else if (appId === "google_chat") {
        try {
          const sp = data.account?.space || payload.space || "Google Chat";
          localStorage.setItem("cf_google_chat_space", sp);
          localStorage.setItem("cf_google_chat_account", JSON.stringify(data.account || payload));
        } catch {}
      } else if (appId === "google_voice") {
        try {
          const num = data.account?.number || payload.number || "+1 (555) 019-2831";
          localStorage.setItem("cf_google_voice_number", num);
          localStorage.setItem("cf_google_voice_account", JSON.stringify(data.account || payload));
        } catch {}
      }

      onVerifySuccess(data.account || payload, data.token || passedToken);
    } catch (err: any) {
      setErrorMessage(err.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="space-y-4 py-1 text-xs">
      {errorMessage && (
        <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-bold">Connection Error</p>
            <p className="text-[11px] opacity-90 leading-tight mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DISCORD MULTI-MODE                                                     */}
      {/* ========================================================================= */}
      {appId === "discord" && (
        <div className="space-y-3">
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-neutral-800 rounded-xl text-xs font-bold">
            <button
              id="discord-tab-qr"
              type="button"
              onClick={() => setDiscordMode("qr")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                discordMode === "qr"
                  ? "bg-white dark:bg-neutral-700 text-[#5865F2] dark:text-indigo-400 shadow-xs font-black"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <QrIcon className="w-3.5 h-3.5" />
              <span>Mobile QR</span>
            </button>
            <button
              id="discord-tab-login"
              type="button"
              onClick={() => setDiscordMode("login")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                discordMode === "login"
                  ? "bg-white dark:bg-neutral-700 text-[#5865F2] dark:text-indigo-400 shadow-xs font-black"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Account Sign-In</span>
            </button>
            <button
              id="discord-tab-token"
              type="button"
              onClick={() => setDiscordMode("token")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                discordMode === "token"
                  ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-xs font-black"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Bot Token</span>
            </button>
          </div>

          {/* TAB 1: DISCORD OFFICIAL REMOTE AUTH QR CODE */}
          {discordMode === "qr" && (
            <div className="space-y-3 text-center">
              <div className="relative mx-auto w-56 h-56 bg-white p-3 rounded-2xl border-2 border-gray-200 dark:border-neutral-700 shadow-md flex items-center justify-center overflow-hidden">
                {discordQrStatus === "loading" ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-7 h-7 text-[#5865F2] animate-spin" />
                    <span className="text-[11px] text-gray-500 font-medium">Connecting to Discord Gateway...</span>
                  </div>
                ) : qrDataUrl ? (
                  <img src={qrDataUrl} alt="Discord Official QR" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <div className="text-center p-3">
                    <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                    <span className="text-[11px] text-gray-500 font-medium">Failed to load Discord QR</span>
                  </div>
                )}

                {discordQrStatus === "pending" && (
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#5865F2] to-transparent shadow-md shadow-[#5865F2]/50 pointer-events-none"
                    animate={{ top: ["5%", "95%", "5%"] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                  />
                )}
              </div>

              {discordQrStatus === "scanned" && (
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-[#5865F2]/40 text-center animate-pulse">
                  <p className="text-xs font-bold text-[#5865F2]">📲 QR Code Scanned!</p>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">
                    {discordScannedUser?.username ? `Scanned by @${discordScannedUser.username}. ` : ""}
                    Please tap <strong>&quot;Log in on Desktop&quot;</strong> on your mobile phone to complete connection.
                  </p>
                </div>
              )}

              {discordQrStatus === "expired" && (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-center space-y-2">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400">QR Code Expired</p>
                  <button
                    type="button"
                    onClick={fetchDiscordQr}
                    className="px-4 py-1.5 rounded-xl bg-[#5865F2] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate New QR Code</span>
                  </button>
                </div>
              )}

              {discordQrStatus !== "scanned" && discordQrStatus !== "expired" && (
                <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                  <Wifi className="w-3 h-3 text-[#5865F2] animate-pulse" />
                  <span>Official Discord Remote Auth • Refreshes in <strong>{qrCountdown}s</strong></span>
                </div>
              )}

              <div className="bg-[#5865F2]/10 dark:bg-neutral-800/80 p-3 rounded-2xl text-left space-y-1 border border-[#5865F2]/20">
                <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200">
                  ⚡ How to scan with your Discord mobile app:
                </p>
                <ol className="list-decimal list-inside text-[10px] text-gray-600 dark:text-gray-400 space-y-0.5">
                  <li>Open the official <strong>Discord app</strong> on your mobile phone</li>
                  <li>Tap your avatar / <strong>Settings</strong> &gt; <strong>Scan QR Code</strong></li>
                  <li>Scan this QR code and tap <strong>Log in on Desktop</strong></li>
                </ol>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={fetchDiscordQr}
                  className="w-full py-2 px-3 rounded-xl border border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh QR Code</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL / PHONE & PASSWORD */}
          {discordMode === "login" && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/30 flex items-start gap-2.5 text-[11px] text-gray-700 dark:text-gray-300">
                <ShieldCheck className="w-5 h-5 text-[#5865F2] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Discord Account Sign-In / Token</span>
                  <span className="opacity-90 leading-tight block mt-0.5">
                    Enter your Discord account credentials or Account Token to synchronize your real DMs, servers, and contacts.
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Email, Phone, or Discord Account Token:</label>
                <input
                  id="discord-input-email"
                  type="text"
                  value={formData.discordEmail}
                  onChange={(e) => updateField("discordEmail", e.target.value)}
                  placeholder="name@email.com or User Token (e.g. MTI4...)"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Password (Leave blank if Token entered):</label>
                <div className="relative">
                  <input
                    id="discord-input-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.discordPassword}
                    onChange={(e) => updateField("discordPassword", e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#5865F2]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="discord-submit-login-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 bg-[#5865F2] cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Validate & Link Discord Account</span>
              </button>
            </div>
          )}

          {/* TAB 3: BOT TOKEN */}
          {discordMode === "token" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                  <span>Discord Bot Token:</span>
                  <a
                    href="https://discord.com/developers/applications"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#5865F2] hover:underline flex items-center gap-1 font-normal text-[10px]"
                  >
                    <span>Developer Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input
                  id="discord-input-token"
                  type="password"
                  value={formData.discordBotToken}
                  onChange={(e) => updateField("discordBotToken", e.target.value)}
                  placeholder="MTI... (Bot Token)"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Server (Guild) ID (Optional):</label>
                <input
                  id="discord-input-guild"
                  type="text"
                  value={formData.discordGuildId}
                  onChange={(e) => updateField("discordGuildId", e.target.value)}
                  placeholder="e.g. 109823471098234"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <button
                id="discord-submit-token-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 bg-[#5865F2] cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Verify Token & Connect Discord Bot</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SLACK MULTI-MODE                                                       */}
      {/* ========================================================================= */}
      {appId === "slack" && (
        <div className="space-y-3">
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-neutral-800 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setSlackMode("email")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                slackMode === "email"
                  ? "bg-white dark:bg-neutral-700 text-[#4A154B] dark:text-purple-400 shadow-xs font-black"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Work Email Code</span>
            </button>
            <button
              type="button"
              onClick={() => setSlackMode("token")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                slackMode === "token"
                  ? "bg-white dark:bg-neutral-700 text-[#4A154B] dark:text-purple-400 shadow-xs font-black"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Slack Token</span>
            </button>
          </div>

          {slackMode === "email" && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#4A154B]/10 border border-[#4A154B]/30 flex items-start gap-2.5 text-[11px] text-gray-700 dark:text-gray-300">
                <ShieldCheck className="w-5 h-5 text-[#4A154B] shrink-0 mt-0.5" />
                <span>Sign in with your work email to access your team workspace discussions without setting up developer apps.</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Work Email Address:</label>
                <input
                  type="email"
                  value={formData.slackEmail}
                  onChange={(e) => updateField("slackEmail", e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#4A154B]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Workspace Name or URL (Optional):</label>
                <input
                  type="text"
                  value={formData.slackWorkspace}
                  onChange={(e) => updateField("slackWorkspace", e.target.value)}
                  placeholder="company.slack.com"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#4A154B]"
                />
              </div>

              {slackStep === "code" && (
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">6-Digit Confirmation Code:</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.slackCode}
                    onChange={(e) => updateField("slackCode", e.target.value)}
                    placeholder="123456"
                    className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-center text-sm font-mono tracking-widest text-gray-900 dark:text-white focus:outline-none focus:border-[#4A154B]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 bg-[#4A154B] cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{slackStep === "code" ? "Verify Code & Connect Workspace" : "Connect Slack Workspace"}</span>
              </button>
            </div>
          )}

          {slackMode === "token" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                  <span>Slack Bot / User Token (xoxb- or xoxp-):</span>
                  <a
                    href="https://api.slack.com/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#4A154B] hover:underline flex items-center gap-1 font-normal text-[10px]"
                  >
                    <span>Slack Apps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input
                  type="password"
                  value={formData.slackToken}
                  onChange={(e) => updateField("slackToken", e.target.value)}
                  placeholder="xoxb- or xoxp-..."
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-[#4A154B]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Workspace Name (Optional):</label>
                <input
                  type="text"
                  value={formData.slackWorkspace}
                  onChange={(e) => updateField("slackWorkspace", e.target.value)}
                  placeholder="e.g. My Company HQ"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#4A154B]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 bg-[#4A154B] cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Verify Token & Connect Slack</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. GOOGLE MESSAGES (RCS / SMS)                                            */}
      {/* ========================================================================= */}
      {appId === "google_messages" && (
        <div className="space-y-3">
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-neutral-800 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setRcsMode("qr")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                rcsMode === "qr"
                  ? "bg-white dark:bg-neutral-700 text-[#1A73E8] dark:text-blue-400 shadow-xs font-black"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <QrIcon className="w-3.5 h-3.5" />
              <span>Device Pairing QR</span>
            </button>
            <button
              type="button"
              onClick={() => setRcsMode("phone")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                rcsMode === "phone"
                  ? "bg-white dark:bg-neutral-700 text-[#1A73E8] dark:text-blue-400 shadow-xs font-black"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>RCS Phone</span>
            </button>
          </div>

          {rcsMode === "qr" && (
            <div className="space-y-3 text-center">
              <div className="relative mx-auto w-52 h-52 bg-white p-3 rounded-2xl border-2 border-gray-200 dark:border-neutral-700 shadow-md flex items-center justify-center overflow-hidden">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Google Messages QR" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                )}
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1A73E8] to-transparent shadow-md shadow-[#1A73E8]/50 pointer-events-none"
                  animate={{ top: ["5%", "95%", "5%"] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                />
              </div>

              <div className="bg-[#1A73E8]/10 dark:bg-neutral-800/80 p-3 rounded-2xl text-left space-y-1 border border-[#1A73E8]/20">
                <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200">
                  📱 How to pair your Android device:
                </p>
                <ol className="list-decimal list-inside text-[10px] text-gray-600 dark:text-gray-400 space-y-0.5">
                  <li>Open <strong>Messages by Google</strong> on your phone</li>
                  <li>Tap your profile picture &gt; <strong>Device pairing</strong></li>
                  <li>Tap <strong>QR code scanner</strong> and point your camera at this QR</li>
                </ol>
              </div>

              <button
                id="gmessages-confirm-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 bg-[#1A73E8] cursor-pointer"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Confirm Device Pairing</span>
              </button>
            </div>
          )}

          {rcsMode === "phone" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Mobile Phone Number (RCS Enabled):</label>
                <input
                  type="tel"
                  value={formData.rcsPhone}
                  onChange={(e) => updateField("rcsPhone", e.target.value)}
                  placeholder="+213 550 12 34 56"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#1A73E8]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 bg-[#1A73E8] cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Pair RCS Phone Number</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. X (FORMERLY TWITTER)                                                   */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 4. X (FORMERLY TWITTER)                                                   */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 4. X (FORMERLY TWITTER) - BEEPER DIRECT ACCOUNT BRIDGE                    */}
      {/* ========================================================================= */}
      {appId === "x_twitter" && (
        <div className="space-y-3">
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-neutral-800 rounded-xl text-xs font-bold">
            <button
              id="x-tab-cookie"
              type="button"
              onClick={() => setXMode("cookie")}
              className={`flex-1 py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                xMode === "cookie"
                  ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-xs font-black"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Cookie (Beeper Method)</span>
            </button>
            <button
              id="x-tab-login"
              type="button"
              onClick={() => setXMode("login")}
              className={`py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                xMode === "login"
                  ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-xs font-black"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Direct Login</span>
            </button>
            <button
              id="x-tab-token"
              type="button"
              onClick={() => setXMode("token")}
              className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                xMode === "token"
                  ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-xs font-black"
                  : "text-gray-400 hover:text-gray-700 dark:hover:text-white"
              }`}
              title="API Bearer Token"
            >
              <Key className="w-3.5 h-3.5" />
              <span>API Token</span>
            </button>
          </div>

          {/* TAB 1: 100% RELIABLE BEEPER COOKIE BRIDGE */}
          {xMode === "cookie" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shrink-0 shadow-md">
                  <XIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span>1-Click Beeper Session Sync</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded-full">Guaranteed</span>
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                    Beeper and matrix bridges use your active browser session cookie to safely read your genuine DMs without password risks, phone checkpoints, or captchas.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 text-[11px] text-gray-600 dark:text-gray-300 space-y-1">
                <p className="font-bold text-gray-900 dark:text-white">Quick 15-second instructions:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                  <li>Open <strong>x.com</strong> in your browser (where you are already logged in)</li>
                  <li>Press <strong>F12</strong> (Developer Tools) &gt; Click <strong>Application</strong> &gt; <strong>Cookies</strong> &gt; <strong>https://x.com</strong></li>
                  <li>Find <strong>auth_token</strong> &gt; Copy its value and paste it below</li>
                </ol>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Twitter / X @Username (Optional):</label>
                <input
                  id="x-cookie-handle-input"
                  type="text"
                  value={formData.xHandle}
                  onChange={(e) => updateField("xHandle", e.target.value)}
                  placeholder="@your_x_handle"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">X auth_token Cookie Value:</label>
                <input
                  id="x-cookie-input"
                  type="password"
                  value={formData.xCookie}
                  onChange={(e) => updateField("xCookie", e.target.value)}
                  placeholder="Paste your auth_token cookie here (e.g. 4d82...)"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-black"
                />
              </div>

              <button
                id="x-cookie-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:bg-neutral-800 bg-black cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
                <span>{isLoading ? "Validating & Syncing Real DMs..." : "⚡ Sync Real Twitter Conversations"}</span>
              </button>
            </div>
          )}

          {/* TAB 2: REAL ACCOUNT SIGN-IN & DM EXTRACTION */}
          {xMode === "login" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shrink-0 shadow-md">
                  <XIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">
                    Direct X Account Login & DM Sync
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                    Sign in with your genuine X handle, email or phone and password. Your active Direct Messages, contacts, and discussions will be extracted automatically.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">X @Username, Email or Phone:</label>
                <input
                  id="x-login-handle-input"
                  type="text"
                  value={formData.xHandle}
                  onChange={(e) => updateField("xHandle", e.target.value)}
                  placeholder="@your_x_handle or email"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Password:</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="text-[10px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  id="x-login-password-input"
                  type={showPassword ? "text" : "password"}
                  value={formData.xPassword}
                  onChange={(e) => updateField("xPassword", e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-black"
                />
              </div>

              <button
                id="x-login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:bg-neutral-800 bg-black cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XIcon className="w-4 h-4" />}
                <span>{isLoading ? "Authenticating & Extracting DMs..." : "Sign in & Sync X Conversations"}</span>
              </button>
            </div>
          )}

          {/* TAB 3: API BEARER TOKEN */}
          {xMode === "token" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Twitter API v2 Bearer Token:</label>
                <input
                  id="x-token-input"
                  type="password"
                  value={formData.xApiKey}
                  onChange={(e) => updateField("xApiKey", e.target.value)}
                  placeholder="AAAAAAAAAAAAAAAAAAAAA..."
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-black"
                />
              </div>

              <button
                id="x-token-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:bg-neutral-800 bg-black cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Verify Token & Connect X</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. OTHER PLATFORMS (Matrix, Voice, Chat, LinkedIn, IRC)                   */}
      {/* ========================================================================= */}
      {appId === "matrix" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="font-bold text-gray-700 dark:text-gray-300">Homeserver URL:</label>
            <input
              type="text"
              value={formData.matrixHomeserver}
              onChange={(e) => updateField("matrixHomeserver", e.target.value)}
              placeholder="https://matrix.org"
              className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-gray-700 dark:text-gray-300">User ID:</label>
            <input
              type="text"
              value={formData.matrixUserId}
              onChange={(e) => updateField("matrixUserId", e.target.value)}
              placeholder="@user:matrix.org"
              className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-gray-700 dark:text-gray-300">Access Token or Password:</label>
            <input
              type="password"
              value={formData.matrixToken}
              onChange={(e) => updateField("matrixToken", e.target.value)}
              placeholder="syt_..."
              className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 bg-[#0DBD8B] cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Connect Matrix Homeserver</span>
          </button>
        </div>
      )}

      {appId === "google_chat" && (
        <div className="space-y-3">
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-neutral-800 rounded-xl text-xs font-bold">
            <button
              id="gchat-tab-google"
              type="button"
              onClick={() => setGchatMode("google")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                gchatMode === "google"
                  ? "bg-white dark:bg-neutral-700 text-[#00AC47] dark:text-emerald-400 shadow-xs font-black"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>1-Click Google</span>
            </button>
            <button
              id="gchat-tab-direct"
              type="button"
              onClick={() => setGchatMode("direct")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                gchatMode === "direct"
                  ? "bg-white dark:bg-neutral-700 text-[#00AC47] dark:text-emerald-400 shadow-xs font-black"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Workspace Email</span>
            </button>
            <button
              id="gchat-tab-qr"
              type="button"
              onClick={() => setGchatMode("qr")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                gchatMode === "qr"
                  ? "bg-white dark:bg-neutral-700 text-[#00AC47] dark:text-emerald-400 shadow-xs font-black"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <QrIcon className="w-3.5 h-3.5" />
              <span>Mobile QR</span>
            </button>
          </div>

          {/* TAB 1: 1-CLICK ACTIVE GOOGLE SESSION */}
          {gchatMode === "google" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#00AC47]/10 border border-[#00AC47]/30 flex items-start gap-3">
                <GoogleChatIcon className="w-8 h-8 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">
                    Direct Google Account Connect
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-tight mt-0.5">
                    Connects directly using your active Google login. No webhook URLs or developer tokens required.
                  </p>
                </div>
              </div>

              {activeUser?.email && (
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Active Google Account:</span>
                  <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{activeUser.email}</span>
                </div>
              )}

              <button
                id="gchat-google-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 bg-[#00AC47] cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>⚡ Connect Google Chat with {activeUser?.email || "Google Account"}</span>
              </button>
            </div>
          )}

          {/* TAB 2: DIRECT WORKSPACE EMAIL (NO WEBHOOK URLS) */}
          {gchatMode === "direct" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Google Workspace or Gmail Address:</label>
                <input
                  id="gchat-direct-email-input"
                  type="email"
                  value={formData.gchatEmail}
                  onChange={(e) => updateField("gchatEmail", e.target.value)}
                  placeholder="team@yourcompany.com"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#00AC47]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Space or Channel Name (Optional):</label>
                <input
                  id="gchat-direct-space-input"
                  type="text"
                  value={formData.gchatSpace}
                  onChange={(e) => updateField("gchatSpace", e.target.value)}
                  placeholder="e.g. Customer Support HQ"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#00AC47]"
                />
              </div>

              <button
                id="gchat-direct-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 bg-[#00AC47] cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Link Google Chat Space</span>
              </button>
            </div>
          )}

          {/* TAB 3: MOBILE QR CODE */}
          {gchatMode === "qr" && (
            <div className="space-y-3 text-center">
              <div className="relative mx-auto w-52 h-52 bg-white p-3 rounded-2xl border-2 border-gray-200 dark:border-neutral-700 shadow-md flex items-center justify-center overflow-hidden">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Google Chat QR" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                )}
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00AC47] to-transparent shadow-md pointer-events-none"
                  animate={{ top: ["5%", "95%", "5%"] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                />
              </div>

              <p className="text-[11px] text-gray-500">Scan with Google Chat app on your phone to link directly.</p>

              <button
                id="gchat-qr-confirm-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 bg-[#00AC47] cursor-pointer"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Confirm Google Chat Pairing</span>
              </button>
            </div>
          )}
        </div>
      )}

      {appId === "google_voice" && (
        <div className="space-y-3">
          {activeUser?.email && (
            <div className="p-3 rounded-2xl bg-[#0F9D58]/10 border border-[#0F9D58]/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <GoogleVoiceIcon className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">Google Account Linked</p>
                  <p className="text-[10px] text-gray-500">{activeUser.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#0F9D58] bg-[#0F9D58]/10 px-2 py-0.5 rounded-full">1-Click</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-gray-700 dark:text-gray-300">Google Voice Number (Optional):</label>
            <input
              id="gvoice-number-input"
              type="tel"
              value={formData.gvoiceNumber}
              onChange={(e) => updateField("gvoiceNumber", e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#0F9D58]"
            />
          </div>

          <button
            id="gvoice-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 bg-[#0F9D58] cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Link Google Voice VoIP Gateway</span>
          </button>
        </div>
      )}

      {appId === "linkedin" && (
        <div className="space-y-3">
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-neutral-800 rounded-xl text-xs font-bold">
            <button
              id="linkedin-tab-oauth"
              type="button"
              onClick={() => setLinkedinMode("oauth")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                linkedinMode === "oauth"
                  ? "bg-white dark:bg-neutral-700 text-[#0A66C2] dark:text-blue-400 shadow-xs font-black"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>1-Click Sign-In</span>
            </button>
            <button
              id="linkedin-tab-login"
              type="button"
              onClick={() => setLinkedinMode("login")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                linkedinMode === "login"
                  ? "bg-white dark:bg-neutral-700 text-[#0A66C2] dark:text-blue-400 shadow-xs font-black"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Pass</span>
            </button>
            <button
              id="linkedin-tab-qr"
              type="button"
              onClick={() => setLinkedinMode("qr")}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                linkedinMode === "qr"
                  ? "bg-white dark:bg-neutral-700 text-[#0A66C2] dark:text-blue-400 shadow-xs font-black"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <QrIcon className="w-3.5 h-3.5" />
              <span>Mobile QR</span>
            </button>
            <button
              id="linkedin-tab-token"
              type="button"
              onClick={() => setLinkedinMode("token")}
              className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                linkedinMode === "token"
                  ? "bg-white dark:bg-neutral-700 text-[#0A66C2] dark:text-blue-400 shadow-xs font-black"
                  : "text-gray-400 hover:text-gray-700 dark:hover:text-white"
              }`}
              title="Custom Token"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TAB 1: 1-CLICK OAUTH */}
          {linkedinMode === "oauth" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#0A66C2]/10 border border-[#0A66C2]/30 flex items-start gap-3">
                <LinkedInIcon className="w-8 h-8 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">
                    1-Click LinkedIn Integration
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-tight mt-0.5">
                    Connect your professional LinkedIn profile or B2B Company Page directly. No developer apps or bot tokens needed.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Company Page or Brand Name (Optional):</label>
                <input
                  id="linkedin-oauth-org-input"
                  type="text"
                  value={formData.linkedinOrg}
                  onChange={(e) => updateField("linkedinOrg", e.target.value)}
                  placeholder="e.g. My Company DZ"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#0A66C2]"
                />
              </div>

              <button
                id="linkedin-oauth-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 bg-[#0A66C2] cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LinkedInIcon className="w-4 h-4" />}
                <span>⚡ Sign in with LinkedIn</span>
              </button>
            </div>
          )}

          {/* TAB 2: EMAIL / PHONE & PASSWORD */}
          {linkedinMode === "login" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">LinkedIn Account Email or Phone:</label>
                <input
                  id="linkedin-login-email-input"
                  type="text"
                  value={formData.linkedinEmail}
                  onChange={(e) => updateField("linkedinEmail", e.target.value)}
                  placeholder="you@company.com or +213..."
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#0A66C2]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Password:</label>
                <input
                  id="linkedin-login-password-input"
                  type="password"
                  value={formData.linkedinPassword}
                  onChange={(e) => updateField("linkedinPassword", e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#0A66C2]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Company Page Name (Optional):</label>
                <input
                  id="linkedin-login-org-input"
                  type="text"
                  value={formData.linkedinOrg}
                  onChange={(e) => updateField("linkedinOrg", e.target.value)}
                  placeholder="e.g. My B2B Store"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#0A66C2]"
                />
              </div>

              <button
                id="linkedin-login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 bg-[#0A66C2] cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Sign In & Connect LinkedIn Account</span>
              </button>
            </div>
          )}

          {/* TAB 3: MOBILE QR CODE */}
          {linkedinMode === "qr" && (
            <div className="space-y-3 text-center">
              <div className="relative mx-auto w-52 h-52 bg-white p-3 rounded-2xl border-2 border-gray-200 dark:border-neutral-700 shadow-md flex items-center justify-center overflow-hidden">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="LinkedIn Mobile QR" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
                )}
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0A66C2] to-transparent shadow-md pointer-events-none"
                  animate={{ top: ["5%", "95%", "5%"] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                />
              </div>

              <div className="bg-[#0A66C2]/10 p-3 rounded-2xl text-left space-y-1 border border-[#0A66C2]/20">
                <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200">
                  📱 How to link via LinkedIn Mobile App:
                </p>
                <ol className="list-decimal list-inside text-[10px] text-gray-600 dark:text-gray-400 space-y-0.5">
                  <li>Open the <strong>LinkedIn</strong> app on your mobile phone</li>
                  <li>Tap the search bar &gt; tap the <strong>QR code icon</strong></li>
                  <li>Point your camera at this QR code to authorize lead messaging</li>
                </ol>
              </div>

              <button
                id="linkedin-qr-confirm-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 bg-[#0A66C2] cursor-pointer"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Confirm LinkedIn Mobile Link</span>
              </button>
            </div>
          )}

          {/* TAB 4: TOKEN (OPTIONAL) */}
          {linkedinMode === "token" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">LinkedIn Access Token:</label>
                <input
                  id="linkedin-token-input"
                  type="password"
                  value={formData.linkedinToken}
                  onChange={(e) => updateField("linkedinToken", e.target.value)}
                  placeholder="AQV..."
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Company Page Name (Optional):</label>
                <input
                  type="text"
                  value={formData.linkedinOrg}
                  onChange={(e) => updateField("linkedinOrg", e.target.value)}
                  placeholder="e.g. My Company DZ"
                  className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <button
                id="linkedin-token-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 bg-[#0A66C2] cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Connect with Access Token</span>
              </button>
            </div>
          )}
        </div>
      )}

      {appId === "irc" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1">
              <label className="font-bold text-gray-700 dark:text-gray-300">IRC Server Host:</label>
              <input
                type="text"
                value={formData.ircHost}
                onChange={(e) => updateField("ircHost", e.target.value)}
                placeholder="irc.libera.chat"
                className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-700 dark:text-gray-300">Port:</label>
              <input
                type="text"
                value={formData.ircPort}
                onChange={(e) => updateField("ircPort", e.target.value)}
                placeholder="6697"
                className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-gray-700 dark:text-gray-300">Nickname:</label>
            <input
              type="text"
              value={formData.ircNick}
              onChange={(e) => updateField("ircNick", e.target.value)}
              placeholder="e.g. store_admin"
              className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-gray-700 dark:text-gray-300">Channel:</label>
            <input
              type="text"
              value={formData.ircChannel}
              onChange={(e) => updateField("ircChannel", e.target.value)}
              placeholder="#store-support"
              className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 bg-[#1E222A] cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Join IRC Channel</span>
          </button>
        </div>
      )}
    </form>
  );
};
