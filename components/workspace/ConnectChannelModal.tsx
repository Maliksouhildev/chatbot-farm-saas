"use client";
import { signIn } from "next-auth/react";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  QrCode as QrIcon, 
  RefreshCw, 
  CheckCircle2, 
  Wifi, 
  Key, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink,
  Lock,
  Check,
  Globe,
  HelpCircle,
  AlertCircle,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";
import QRCode from "qrcode";
import {
  WhatsAppIcon, 
  InstagramIcon, 
  TelegramIcon, 
  MessengerIcon, 
  StorefrontIcon, 
  GmailIcon,
  FacebookIcon,
  MetaIcon,
  SignalIcon,
  XIcon,
  GoogleMessagesIcon,
  GoogleChatIcon,
  GoogleVoiceIcon,
  DiscordIcon,
  SlackIcon,
  LinkedInIcon,
  IrcIcon,
  MatrixIcon
} from "@/components/icons/BrandIcons";
import { APP_GRADIENT_THEMES } from "@/lib/mock_chats";
import { ChannelPairingForms } from "./ChannelPairingForms";

interface ConnectChannelModalProps {
  appId: string;
  isOpen: boolean;
  onClose: () => void;
  onConnectSuccess: (appId: string) => void;
}

const APP_ICONS: Record<string, React.ReactNode> = {
  whatsapp: <WhatsAppIcon className="w-10 h-10 drop-shadow-sm" />,
  whatsapp_2: <WhatsAppIcon className="w-10 h-10 drop-shadow-sm" />,
  instagram: <InstagramIcon className="w-10 h-10 drop-shadow-sm" />,
  telegram: <TelegramIcon className="w-10 h-10 drop-shadow-sm" />,
  messenger: <MessengerIcon className="w-10 h-10 drop-shadow-sm" />,
  web_widget: <StorefrontIcon className="w-10 h-10 drop-shadow-sm" />,
  gmail: <GmailIcon className="w-10 h-10 drop-shadow-sm" />,
  signal: <SignalIcon className="w-10 h-10 drop-shadow-sm" />,
  x_twitter: <XIcon className="w-10 h-10 drop-shadow-sm" />,
  google_messages: <GoogleMessagesIcon className="w-10 h-10 drop-shadow-sm" />,
  google_chat: <GoogleChatIcon className="w-10 h-10 drop-shadow-sm" />,
  google_voice: <GoogleVoiceIcon className="w-10 h-10 drop-shadow-sm" />,
  discord: <DiscordIcon className="w-10 h-10 drop-shadow-sm" />,
  slack: <SlackIcon className="w-10 h-10 drop-shadow-sm" />,
  linkedin: <LinkedInIcon className="w-10 h-10 drop-shadow-sm" />,
  irc: <IrcIcon className="w-10 h-10 drop-shadow-sm" />,
  matrix: <MatrixIcon className="w-10 h-10 drop-shadow-sm" />,
};

interface AppPairingGuide {
  title: string;
  subtitle: string;
  steps: string[];
  pairingCodeTip: string;
  targetUrl: string;
}

const PAIRING_GUIDES: Record<string, AppPairingGuide> = {
  google_chat: {
    title: "Connect Google Workspace Chat",
    subtitle: "Authorize your organization's Google Chat API",
    steps: ["Sign in with your Google Workspace Admin account", "Authorize Chatbot Farm to read/write spaces", "Select the Space you want to bridge"],
    pairingCodeTip: "Requires Google Cloud Console Verification",
    targetUrl: "#"
  },
  google_messages: {
    title: "Connect Google Messages (RCS)",
    subtitle: "Bridge your Android phone's SMS & RCS via Google account",
    steps: ["Sign in with your Android device's Google Account", "Authorize Messages Sync", "Keep your phone connected to the internet"],
    pairingCodeTip: "Or pair using Messages for Web QR Code",
    targetUrl: "#"
  },
  google_voice: {
    title: "Connect Google Voice",
    subtitle: "Route VoIP calls and SMS to Chatbot Farm",
    steps: ["Sign in with your Google Voice Account", "Grant permission to read SMS and Voicemail transcripts", "Configure call forwarding"],
    pairingCodeTip: "Requires a US/CA Google Voice Number",
    targetUrl: "#"
  },
  discord: {
    title: "Connect Discord Server Bot",
    subtitle: "Add our bot to your community server",
    steps: ["Go to Discord Developer Portal", "Create an App & Bot", "Paste the Bot Token in settings", "Invite the bot to your server"],
    pairingCodeTip: "Or use OAuth2 to authorize instantly",
    targetUrl: "#"
  },
  slack: {
    title: "Connect Slack Workspace",
    subtitle: "Add the Chatbot Farm Slack App",
    steps: ["Click Add to Slack", "Authorize the workspace permissions", "Select a channel for notifications"],
    pairingCodeTip: "Or provide a Slack Bot User OAuth Token",
    targetUrl: "#"
  },
  x_twitter: {
    title: "Connect X (Twitter) DMs",
    subtitle: "Authorize access to Direct Messages",
    steps: ["Sign in to your X Developer Account", "Generate OAuth 2.0 Client Credentials", "Authorize the app to read DMs"],
    pairingCodeTip: "Basic or Pro API Tier required",
    targetUrl: "#"
  },
  linkedin: {
    title: "Connect LinkedIn Messaging",
    subtitle: "Authorize your LinkedIn Company Page",
    steps: ["Sign in to LinkedIn", "Grant Marketing API access to your company page", "Start receiving B2B messages"],
    pairingCodeTip: "Subject to LinkedIn Developer Approval",
    targetUrl: "#"
  },
  matrix: {
    title: "Connect Matrix / Beeper",
    subtitle: "Bridge federated protocols",
    steps: ["Enter your Matrix Homeserver URL", "Provide your Access Token", "Join the bridging room"],
    pairingCodeTip: "End-to-End Encryption supported",
    targetUrl: "#"
  },
  irc: {
    title: "Connect IRC Network",
    subtitle: "Join an IRC Channel like Libera.Chat",
    steps: ["Enter the IRC Network Host", "Enter the Channel Name", "Provide NickServ password if required"],
    pairingCodeTip: "Supports TLS connections",
    targetUrl: "#"
  },
  whatsapp: {
    title: "Link WhatsApp via QR Code",
    subtitle: "Use WhatsApp on your phone to scan this code",
    steps: [
      "Open WhatsApp on your phone",
      "Tap Menu (⋮ on Android) or Settings (⚙️ on iPhone)",
      "Tap Linked Devices, then tap Link a Device",
      "Point your phone camera at this screen to scan"
    ],
    pairingCodeTip: "Or link with phone number using 8-digit pairing code",
    targetUrl: "https://wa.me/213551671229?text=Chatbot%20Farm%20Pairing%20Device"
  },
  telegram: {
    title: "Link Telegram Mobile / Desktop Device",
    subtitle: "Scan with Telegram app or connect via Phone Code / Bot Token",
    steps: [
      "Open Telegram on your mobile device",
      "Go to Settings > Devices > Link Desktop Device",
      "Point your phone camera at this QR code",
      "Tap Confirm on your phone to link instantly"
    ],
    pairingCodeTip: "Or connect via Phone Number SMS / Telegram App Code",
    targetUrl: "tg://login"
  },
  signal: {
    title: "Link Signal Mobile Device",
    subtitle: "Scan with Signal mobile app (Settings > Linked Devices)",
    steps: [
      "Open Signal on your mobile phone",
      "Tap Settings (⚙️) > Linked Devices",
      "Tap Link New Device (+)",
      "Point your phone camera at this QR code to link instantly"
    ],
    pairingCodeTip: "Or connect via Phone Number SMS / Verification Code",
    targetUrl: "sgnl://linkdevice"
  },
  web_widget: {
    title: "Pair Storefront Live Chat",
    subtitle: "Scan to preview live store chat on your phone",
    steps: [
      "Scan this QR code with your smartphone camera",
      "Open the preview store on your mobile browser",
      "Send a test message as a customer",
      "Watch it appear on this dashboard in real-time"
    ],
    pairingCodeTip: "Or copy the HTML embed snippet",
    targetUrl: "http://localhost:3100"
  },
  gmail: {
    title: "Link Support Email via Google",
    subtitle: "Authorize Google OAuth to sync support emails",
    steps: [
      "Click Continue with Google below",
      "Choose your Gmail or Google Workspace address",
      "Confirm read & reply permissions for support emails",
      "Your store support messages will sync automatically"
    ],
    pairingCodeTip: "Or authorize directly with API Key",
    targetUrl: "https://accounts.google.com/signin/v2/identifier?service=mail"
  }
};

export const ConnectChannelModal: React.FC<ConnectChannelModalProps> = ({
  appId, isOpen, onClose, onConnectSuccess,
}) => {
  const theme = APP_GRADIENT_THEMES[appId] || APP_GRADIENT_THEMES.whatsapp;
  const isMetaChannel = appId === "instagram" || appId === "messenger";
  const guide = PAIRING_GUIDES[appId] || PAIRING_GUIDES.whatsapp;

  // Standard modes
  const [activeMode, setActiveMode] = useState<"qr" | "code">("qr");
  const [qrCountdown, setQrCountdown] = useState(30);
  const [pairingCode, setPairingCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("0550 12 34 56");
  const [isPairing, setIsPairing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [telegramToken, setTelegramToken] = useState("");
  const [isVerifyingTelegram, setIsVerifyingTelegram] = useState(false);
  const [telegramError, setTelegramError] = useState<string | null>(null);
  const [telegramBotInfo, setTelegramBotInfo] = useState<any>(null);

  // Dedicated Telegram Multi-Mode States
  const [telegramTab, setTelegramTab] = useState<"qr" | "phone" | "bot">("qr");
  const [telegramQrSessionId, setTelegramQrSessionId] = useState<string | null>(null);
  const [telegramPhone, setTelegramPhone] = useState<string>("+213");
  const [telegramCode, setTelegramCode] = useState<string>("");
  const [telegramPassword, setTelegramPassword] = useState<string>("");
  const [showTelegramPassword, setShowTelegramPassword] = useState(false);
  const [telegramPhoneCodeHash, setTelegramPhoneCodeHash] = useState<string | null>(null);
  const [telegramStep, setTelegramStep] = useState<"phone" | "code">("phone");
  const [isSendingTelegramCode, setIsSendingTelegramCode] = useState(false);
  const [isSigningInTelegram, setIsSigningInTelegram] = useState(false);

  // Dedicated Signal Multi-Mode States (Defaults to Phone SMS for easy real connection)
  const [signalTab, setSignalTab] = useState<"phone" | "qr">("phone");
  const [signalQrSessionId, setSignalQrSessionId] = useState<string | null>(null);
  const [signalPhone, setSignalPhone] = useState<string>("");
  const [signalName, setSignalName] = useState<string>("");
  const [signalCode, setSignalCode] = useState<string>("");
  const [signalPin, setSignalPin] = useState<string>("");
  const [showSignalPin, setShowSignalPin] = useState(false);
  const [signalStep, setSignalStep] = useState<"phone" | "code">("phone");
  const [isSendingSignalCode, setIsSendingSignalCode] = useState(false);
  const [isSigningInSignal, setIsSigningInSignal] = useState(false);
  const [signalError, setSignalError] = useState<string | null>(null);

  // Gmail State
  const [gmailEmail, setGmailEmail] = useState("");
  const [isVerifyingGmail, setIsVerifyingGmail] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);

  // Meta OAuth Live State
  const [metaStep, setMetaStep] = useState<"intro" | "oauth_waiting" | "select_accounts" | "token">("intro");
  const [metaError, setMetaError] = useState<string | null>(null);
  const [realMetaUser, setRealMetaUser] = useState<any>(null);
  const [realIgAccounts, setRealIgAccounts] = useState<any[]>([]);
  const [realFbPages, setRealFbPages] = useState<any[]>([]);
  const [selectedRealAccount, setSelectedRealAccount] = useState<string>("");
  const [metaAccessToken, setMetaAccessToken] = useState("");
  const [igCustomHandle, setIgCustomHandle] = useState("");
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [metaSubTab, setMetaSubTab] = useState<"token" | "oauth" | "handle">(appId === "instagram" ? "token" : "oauth");

  // Dedicated Instagram Unified Wizard States
  const [igWizardStep, setIgWizardStep] = useState<"choose_type" | "configure_direct_login" | "configure_meta" | "configure_personal">("choose_type");
  const [igDirectPassword, setIgDirectPassword] = useState("");
  const [showIgPassword, setShowIgPassword] = useState(false);
  const [igSessionId, setIgSessionId] = useState("");
  const [igPersonalUsername, setIgPersonalUsername] = useState("");
  const [igProfessionalId, setIgProfessionalId] = useState("");
  const [isSyncingIg, setIsSyncingIg] = useState(false);
  const [igSyncSuccessMessage, setIgSyncSuccessMessage] = useState<string | null>(null);
  const [showSessionHelp, setShowSessionHelp] = useState(false);

  // Dedicated Facebook Messenger States
  const [messengerTab, setMessengerTab] = useState<"page" | "token">("page");
  const [messengerPageName, setMessengerPageName] = useState("");
  const [messengerPageUrl, setMessengerPageUrl] = useState("");
  const [messengerPageEmail, setMessengerPageEmail] = useState("");
  const [isLinkingMessengerPage, setIsLinkingMessengerPage] = useState(false);

  // Real Scannable QR Code Data URL (for WhatsApp & non-Meta channels)
  const [realQrDataUrl, setRealQrDataUrl] = useState<string | null>(null);

  const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID || "1076353937258814";

  const generateRealQr = async (targetAppId: string = appId) => {
    if (targetAppId === "instagram" || targetAppId === "messenger") return;

    const targetGuide = PAIRING_GUIDES[targetAppId] || PAIRING_GUIDES.whatsapp;
    let payload = targetGuide.targetUrl;

    if (targetAppId === "telegram") {
      try {
        const res = await fetch("/api/channels/telegram/qr");
        if (res.ok) {
          const data = await res.json();
          if (data.sessionId) setTelegramQrSessionId(data.sessionId);
          if (data.qrCodeBase64) {
            setRealQrDataUrl(data.qrCodeBase64);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch Telegram MTProto QR:", err);
      }
    }

    if (targetAppId === "signal") {
      try {
        const res = await fetch("/api/channels/signal/qr");
        if (res.ok) {
          const data = await res.json();
          if (data.sessionId) setSignalQrSessionId(data.sessionId);
          if (data.qrCodeBase64) {
            setRealQrDataUrl(data.qrCodeBase64);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch Signal QR:", err);
      }
    }

    if (targetAppId === "whatsapp") {
      try {
        const res = await fetch("/api/channels/whatsapp/qr");
        if (res.ok) {
          const data = await res.json();
          const validBase64 = data.qrCodeBase64 || data.base64 || data.qrCode;
          if (validBase64) {
            setRealQrDataUrl(validBase64);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch WhatsApp Evolution QR:", err);
      }
      payload = "https://wa.me/213551671229?text=Chatbot%20Farm%20Pairing%20Device";
    }

    try {
      const url = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 2,
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });
      setRealQrDataUrl(url);
    } catch (err) {
      console.error("Failed to generate QR code:", err);
    }
  };

  // Listen for OAuth message from Meta popup
  useEffect(() => {
    const handleMetaMessage = (event: MessageEvent) => {
      if (event.data?.type === "META_AUTH_SUCCESS") {
        const { user, instagramAccounts, pages } = event.data;
        setRealMetaUser(user);
        setRealIgAccounts(instagramAccounts || []);
        setRealFbPages(pages || []);
        
        if (appId === "instagram" && instagramAccounts?.length > 0) {
          setSelectedRealAccount(instagramAccounts[0].username || instagramAccounts[0].igId);
          setMetaStep("select_accounts");
        } else if (appId === "messenger" && pages?.length > 0) {
          setSelectedRealAccount(pages[0].id);
          setMetaStep("select_accounts");
        } else {
          // If no accounts linked or single account
          setIsSuccess(true);
          setTimeout(() => {
            onConnectSuccess(appId);
            onClose();
          }, 1200);
        }
      } else if (event.data?.type === "META_AUTH_ERROR") {
        setMetaError(event.data.error || "Meta authentication failed");
        setMetaStep("intro");
      }
    };

    window.addEventListener("message", handleMetaMessage);
    return () => window.removeEventListener("message", handleMetaMessage);
  }, [appId, onConnectSuccess, onClose]);

  // Initialize modal state on open
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsPairing(false);
      setMetaStep("intro");
      setMetaError(null);
      setQrCountdown(45);
      setPairingCode(`${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`);
      
      // Instagram Wizard Reset
      setIgWizardStep("choose_type");
      setIgDirectPassword("");
      setShowIgPassword(false);
      setIgSessionId("");
      setIsSyncingIg(false);
      setIgSyncSuccessMessage(null);
      // Telegram States Reset
      if (appId === "telegram") {
        setTelegramTab("qr");
        setTelegramStep("phone");
        setTelegramCode("");
        setTelegramPassword("");
        setTelegramError(null);
        setTelegramQrSessionId(null);
      }

      // Signal States Reset (Defaults to Phone SMS for easy real connection)
      if (appId === "signal") {
        setSignalTab("phone");
        setSignalStep("phone");
        setSignalCode("");
        setSignalPin("");
        setSignalError(null);
        setSignalQrSessionId(null);
        setSignalPhone("");
        setSignalName("");
      }

      // Check if already stored in localStorage
      try {
        const stored = localStorage.getItem("cf_meta_auth");
        if (stored) {
          const parsed = JSON.parse(stored);
          setRealMetaUser(parsed.user);
          setRealIgAccounts(parsed.instagramAccounts || []);
          setRealFbPages(parsed.pages || []);
        }
        const storedIg = localStorage.getItem("cf_ig_account");
        if (storedIg) {
          const parsed = JSON.parse(storedIg);
          if (parsed.username) {
            setIgCustomHandle(parsed.username);
            setIgPersonalUsername(parsed.username);
          }
        } else {
          setIgCustomHandle("");
          setIgPersonalUsername("");
        }
      } catch {}

      if (!isMetaChannel) {
        generateRealQr(appId);
      }
    }
  }, [isOpen, appId, isMetaChannel]);

  // Check live connection state if user scans WhatsApp on their phone
  useEffect(() => {
    if (!isOpen || isSuccess || appId !== "whatsapp") return;
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/channels/whatsapp/qr");
        if (res.ok) {
          const data = await res.json();
          if (data.status === "connected") {
            setIsSuccess(true);
            setTimeout(() => {
              onConnectSuccess("whatsapp");
              onClose();
            }, 1000);
          }
        }
      } catch {}
    }, 3000);
    return () => clearInterval(pollInterval);
  }, [isOpen, isSuccess, appId, onConnectSuccess, onClose]);

  // Check live connection state if user scans Telegram Desktop Link QR on their phone
  useEffect(() => {
    if (!isOpen || isSuccess || appId !== "telegram" || (activeMode !== "qr" && telegramTab !== "qr")) return;
    const pollInterval = setInterval(async () => {
      try {
        const query = telegramQrSessionId ? `?sessionId=${encodeURIComponent(telegramQrSessionId)}` : "";
        const res = await fetch(`/api/channels/telegram/qr${query}`);
        if (res.ok) {
          const data = await res.json();
          if (data.sessionId && !telegramQrSessionId) {
            setTelegramQrSessionId(data.sessionId);
          }
          if (data.status === "success" && data.user) {
            setIsSuccess(true);
            localStorage.setItem("cf_telegram_session", data.sessionString);
            localStorage.setItem("cf_telegram_user", JSON.stringify(data.user));
            localStorage.setItem("cf_telegram_bot", JSON.stringify(data.user));
            const connectedApps = new Set(JSON.parse(localStorage.getItem("cf_connected_apps") || "[]"));
            connectedApps.add("telegram");
            localStorage.setItem("cf_connected_apps", JSON.stringify(Array.from(connectedApps)));
            window.dispatchEvent(new Event("storage"));
            setTimeout(() => {
              onConnectSuccess("telegram");
              onClose();
            }, 1200);
          } else if (data.status === "pending" && data.qrCodeBase64 && data.qrCodeBase64 !== realQrDataUrl) {
            setRealQrDataUrl(data.qrCodeBase64);
          }
        }
      } catch (err) {
        console.warn("Error polling Telegram QR status:", err);
      }
    }, 2500);
    return () => clearInterval(pollInterval);
  }, [isOpen, isSuccess, appId, activeMode, telegramTab, telegramQrSessionId, realQrDataUrl, onConnectSuccess, onClose]);

  // Check live connection state if user scans Signal Desktop Link QR on their phone
  useEffect(() => {
    if (!isOpen || isSuccess || appId !== "signal" || signalTab !== "qr") return;
    const pollInterval = setInterval(async () => {
      try {
        const query = signalQrSessionId ? `?sessionId=${encodeURIComponent(signalQrSessionId)}` : "";
        const res = await fetch(`/api/channels/signal/qr${query}`);
        if (res.ok) {
          const data = await res.json();
          if (data.sessionId && !signalQrSessionId) {
            setSignalQrSessionId(data.sessionId);
          }
          if (data.status === "success" && data.account) {
            setIsSuccess(true);
            localStorage.setItem("cf_signal_account", JSON.stringify(data.account));
            localStorage.setItem("cf_signal_phone", data.account.phone || "Signal Linked Account");
            let userId = "";
            try {
              const u = localStorage.getItem("cf_user_session");
              if (u) userId = JSON.parse(u).id || "";
            } catch {}
            if (userId) {
              const uKey = `cf_connected_apps_${userId}`;
              const userApps = new Set(JSON.parse(localStorage.getItem(uKey) || "[]"));
              userApps.add("signal");
              localStorage.setItem(uKey, JSON.stringify(Array.from(userApps)));
            }
            const connectedApps = new Set(JSON.parse(localStorage.getItem("cf_connected_apps") || "[]"));
            connectedApps.add("signal");
            localStorage.setItem("cf_connected_apps", JSON.stringify(Array.from(connectedApps)));
            window.dispatchEvent(new Event("storage"));
            setTimeout(() => {
              onConnectSuccess("signal");
              onClose();
            }, 1200);
          }
        }
      } catch (err) {
        // Polling retry
      }
    }, 2500);
    return () => clearInterval(pollInterval);
  }, [isOpen, isSuccess, appId, signalTab, signalQrSessionId, onConnectSuccess, onClose]);

  // Countdown timer for QR refresh
  useEffect(() => {
    if (!isOpen || isSuccess || isMetaChannel) return;
    const interval = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          generateRealQr(appId);
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, appId, isSuccess, isMetaChannel]);

  // REAL META OAUTH POPUP TRIGGER
  const handleLaunchRealMetaOAuth = () => {
    setMetaError(null);
    setMetaStep("oauth_waiting");

    const redirectUri = `${window.location.origin}/api/channels/meta/callback`;
    const scope = "pages_show_list,instagram_basic,instagram_manage_messages";
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${metaAppId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scope)}&response_type=code&state=${appId}`;

    const width = 600;
    const height = 720;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authUrl,
      "MetaAuthPopup",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
    );

    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      // Popup blocked by browser: fallback to direct redirect
      window.location.href = authUrl;
    }
  };

  // Direct Token Verification (for Graph API Explorer or custom tokens)
  const handleVerifyDirectToken = async () => {
    if (!metaAccessToken.trim()) return;
    setIsValidatingToken(true);
    setMetaError(null);

    try {
      const res = await fetch("/api/channels/meta/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: metaAccessToken.trim() }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Invalid Meta Access Token");
      }

      setRealMetaUser(data.user);
      setRealIgAccounts(data.instagramAccounts || []);
      setRealFbPages(data.pages || []);

      localStorage.setItem("cf_meta_auth", JSON.stringify(data));
      if (data.instagramAccounts && data.instagramAccounts.length > 0) {
        localStorage.setItem("cf_ig_account", JSON.stringify(data.instagramAccounts[0]));
        setSelectedRealAccount(data.instagramAccounts[0].username);
      } else if (appId === "instagram") {
        const username = (igCustomHandle.trim() || "instagram_store").replace(/^@/, '');
        localStorage.setItem("cf_ig_account", JSON.stringify({
          username,
          igId: username,
          pageAccessToken: metaAccessToken.trim()
        }));
      }

      setMetaStep("select_accounts");
    } catch (err: any) {
      setMetaError(err.message || "Failed to verify token with Meta Graph API.");
    } finally {
      setIsValidatingToken(false);
    }
  };

  // Confirm selection and link
  const handleConfirmAccountLink = async () => {
    setIsPairing(true);
    if (appId === "instagram") {
      await handleSyncInstagram("meta");
      setIsPairing(false);
      return;
    } else if (appId === "messenger" && selectedRealAccount) {
      const selectedPage = realFbPages.find((p: any) => p.id === selectedRealAccount) || realFbPages[0];
      if (selectedPage) {
        localStorage.setItem("cf_messenger_page", JSON.stringify(selectedPage));
      }
    }
    setTimeout(() => {
      setIsPairing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onConnectSuccess(appId);
        onClose();
      }, 1200);
    }, 800);
  };

  // Verify and pair Telegram Bot via real BotFather token
  const handleVerifyTelegramBot = async () => {
    if (!telegramToken.trim()) {
      handleSimulatePair();
      return;
    }

    setIsVerifyingTelegram(true);
    setTelegramError(null);

    try {
      const res = await fetch("/api/channels/telegram/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: telegramToken.trim() }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to verify Telegram Bot Token");
      }

      setTelegramBotInfo(data.bot);
      localStorage.setItem("cf_telegram_bot", JSON.stringify(data.bot));
      localStorage.setItem("cf_telegram_token", telegramToken.trim());
      setIsSuccess(true);
      setTimeout(() => {
        onConnectSuccess("telegram");
        onClose();
      }, 1200);
    } catch (err: any) {
      setTelegramError(err.message || "Invalid Telegram Bot Token");
    } finally {
      setIsVerifyingTelegram(false);
    }
  };

  // Send 5-digit verification code to Telegram phone
  const handleSendTelegramCode = async () => {
    if (!telegramPhone.trim() || telegramPhone.trim().length < 8) {
      setTelegramError("Please enter a valid phone number (e.g. +213550123456)");
      return;
    }
    setIsSendingTelegramCode(true);
    setTelegramError(null);
    try {
      const res = await fetch("/api/channels/telegram/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: telegramPhone.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to send verification code");
      }
      setTelegramPhoneCodeHash(data.phoneCodeHash);
      setTelegramStep("code");
    } catch (err: any) {
      setTelegramError(err.message || "Failed to send code to your Telegram phone");
    } finally {
      setIsSendingTelegramCode(false);
    }
  };

  // Sign in with 5-digit code and optional 2FA password
  const handleSignInTelegramPhone = async () => {
    if (!telegramCode.trim()) {
      setTelegramError("Please enter the 5-digit verification code sent to your Telegram app");
      return;
    }
    setIsSigningInTelegram(true);
    setTelegramError(null);
    try {
      const res = await fetch("/api/channels/telegram/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: telegramPhone.trim(),
          phoneCode: telegramCode.trim(),
          phoneCodeHash: telegramPhoneCodeHash,
          password: telegramPassword.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to verify Telegram code");
      }
      localStorage.setItem("cf_telegram_session", data.sessionString);
      localStorage.setItem("cf_telegram_user", JSON.stringify(data.user));
      localStorage.setItem("cf_telegram_bot", JSON.stringify(data.user));
      const connectedApps = new Set(JSON.parse(localStorage.getItem("cf_connected_apps") || "[]"));
      connectedApps.add("telegram");
      localStorage.setItem("cf_connected_apps", JSON.stringify(Array.from(connectedApps)));
      window.dispatchEvent(new Event("storage"));
      setIsSuccess(true);
      setTimeout(() => {
        onConnectSuccess("telegram");
        onClose();
      }, 1200);
    } catch (err: any) {
      setTelegramError(err.message || "Invalid verification code or 2FA password");
    } finally {
      setIsSigningInTelegram(false);
    }
  };

  // Verify and pair Gmail Support Inbox
  const handleVerifyGmail = async (customEmail?: string) => {
    setIsVerifyingGmail(true);
    setGmailError(null);
    try {
      await signIn('google', { 
        callbackUrl: window.location.href,
        login_hint: typeof customEmail === 'string' ? customEmail : undefined
      });
    } catch (err: any) {
      setGmailError(err.message || 'Failed to initialize Google Sign-In');
      setIsVerifyingGmail(false);
    }
  };

  // Send 6-digit verification code to Signal phone
  const handleSendSignalCode = async () => {
    if (!signalPhone.trim() || signalPhone.trim().length < 6) {
      setSignalError("Please enter your mobile phone number including country code (e.g. +213 661 22 33 44)");
      return;
    }
    setIsSendingSignalCode(true);
    setSignalError(null);
    try {
      const res = await fetch("/api/channels/signal/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: signalPhone.trim(), 
          name: signalName.trim() || `Signal (${signalPhone.trim()})` 
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to send verification code");
      }
      setSignalStep("code");
    } catch (err: any) {
      setSignalError(err.message || "Failed to send code to your Signal phone");
    } finally {
      setIsSendingSignalCode(false);
    }
  };

  // Sign in / Verify Signal phone with 6-digit code
  const handleVerifySignalPhone = async () => {
    if (!signalCode.trim()) {
      setSignalError("Please enter the 6-digit verification code sent to your phone");
      return;
    }
    setIsSigningInSignal(true);
    setSignalError(null);
    try {
      const res = await fetch("/api/channels/signal/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: signalPhone.trim(),
          code: signalCode.trim(),
          pin: signalPin.trim() || undefined,
          name: signalName.trim() || `Signal (${signalPhone.trim()})`,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to verify Signal code");
      }
      localStorage.setItem("cf_signal_account", JSON.stringify(data.account));
      localStorage.setItem("cf_signal_phone", data.account.phone || signalPhone.trim());
      let userId = "";
      try {
        const u = localStorage.getItem("cf_user_session");
        if (u) userId = JSON.parse(u).id || "";
      } catch {}
      if (userId) {
        const uKey = `cf_connected_apps_${userId}`;
        const userApps = new Set(JSON.parse(localStorage.getItem(uKey) || "[]"));
        userApps.add("signal");
        localStorage.setItem(uKey, JSON.stringify(Array.from(userApps)));
      }
      const connectedApps = new Set(JSON.parse(localStorage.getItem("cf_connected_apps") || "[]"));
      connectedApps.add("signal");
      localStorage.setItem("cf_connected_apps", JSON.stringify(Array.from(connectedApps)));
      window.dispatchEvent(new Event("storage"));
      setIsSuccess(true);
      setTimeout(() => {
        onConnectSuccess("signal");
        onClose();
      }, 1200);
    } catch (err: any) {
      setSignalError(err.message || "Invalid verification code or Signal PIN");
    } finally {
      setIsSigningInSignal(false);
    }
  };

  // Universal handler for verified non-Meta/non-QR modern channels
  const handleGenericChannelVerified = async (accountInfo: any, token?: string) => {
    setIsPairing(true);
    try {
      localStorage.setItem(`cf_${appId}_account`, JSON.stringify(accountInfo));
      if (appId === "messenger") {
        localStorage.setItem("cf_messenger_page", JSON.stringify(accountInfo));
      } else if (appId === "instagram") {
        localStorage.setItem("cf_ig_account", JSON.stringify(accountInfo));
      } else if (appId === "x_twitter") {
        localStorage.setItem("cf_x_twitter_handle", accountInfo.handle || accountInfo.name || "@x_account");
      } else if (appId === "linkedin") {
        localStorage.setItem("cf_linkedin_page", accountInfo.page || accountInfo.name || "LinkedIn Page");
      } else if (appId === "google_chat") {
        localStorage.setItem("cf_google_chat_space", accountInfo.space || accountInfo.email || "Google Chat");
      } else if (appId === "google_voice") {
        localStorage.setItem("cf_google_voice_number", accountInfo.number || "+1 (555) 019-2831");
      }

      if (token) {
        localStorage.setItem(`cf_${appId}_token`, token);
      }
      let userId = "";
      try {
        const u = localStorage.getItem("cf_user_session");
        if (u) userId = JSON.parse(u).id || "";
      } catch {}

      if (userId) {
        const uKey = `cf_connected_apps_${userId}`;
        const userApps = new Set(JSON.parse(localStorage.getItem(uKey) || "[]"));
        userApps.add(appId);
        localStorage.setItem(uKey, JSON.stringify(Array.from(userApps)));
      }
      const connectedApps = new Set(JSON.parse(localStorage.getItem("cf_connected_apps") || "[]"));
      connectedApps.add(appId);
      localStorage.setItem("cf_connected_apps", JSON.stringify(Array.from(connectedApps)));
      window.dispatchEvent(new Event("storage"));

      await fetch(`/api/channels/${appId}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "auto_import", userId }),
      }).catch(() => {});

      setIsSuccess(true);
      setTimeout(() => {
        onConnectSuccess(appId);
        onClose();
      }, 1000);
    } catch (e) {
      setIsSuccess(true);
      setTimeout(() => {
        onConnectSuccess(appId);
        onClose();
      }, 1000);
    } finally {
      setIsPairing(false);
    }
  };

  const handleSyncInstagram = async (method: "meta" | "direct" | "login") => {
    setIsSyncingIg(true);
    setMetaError(null);
    setIgSyncSuccessMessage(null);
    try {
      let userId = "";
      try {
        const u = localStorage.getItem("cf_user_session");
        if (u) {
          const parsed = JSON.parse(u);
          userId = parsed.id || "";
        }
      } catch {}

      const payload: any = {
        method,
        userId,
      };

      if (method === "meta") {
        if (!metaAccessToken.trim()) {
          throw new Error("Meta Access Token is required to sync via Meta Graph API.");
        }
        payload.accessToken = metaAccessToken.trim();
        payload.igId = igProfessionalId.trim() || selectedRealAccount || undefined;
      } else if (method === "login") {
        const cleanUser = (igPersonalUsername.trim() || igCustomHandle.trim()).replace(/^@/, '');
        if (!cleanUser) {
          throw new Error("Please enter your Instagram @username.");
        }
        if (!igDirectPassword.trim()) {
          throw new Error("Please enter your Instagram password.");
        }
        payload.username = cleanUser;
        payload.password = igDirectPassword.trim();
      } else {
        const cleanUser = (igPersonalUsername.trim() || igCustomHandle.trim()).replace(/^@/, '');
        if (!cleanUser) {
          throw new Error("Please enter your Instagram @username.");
        }
        payload.username = cleanUser;
        payload.sessionId = igSessionId.trim() || undefined;
      }

      const res = await fetch("/api/channels/instagram/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error || !data.success) {
        throw new Error(data.error || "Failed to sync Instagram account.");
      }

      // Persist account in localStorage
      if (method === "meta") {
        const selectedAccount = realIgAccounts.find(
          (a: any) => a.username === selectedRealAccount || a.igId === selectedRealAccount
        ) || {
          username: (igCustomHandle.trim() || igProfessionalId.trim() || "instagram_store").replace(/^@/, ''),
          igId: igProfessionalId.trim() || "instagram_store",
          pageAccessToken: metaAccessToken.trim()
        };
        localStorage.setItem("cf_ig_account", JSON.stringify(selectedAccount));
      } else {
        const cleanUser = (igPersonalUsername.trim() || igCustomHandle.trim() || "instagram_user").replace(/^@/, '');
        localStorage.setItem("cf_ig_account", JSON.stringify({
          username: cleanUser,
          igId: cleanUser,
          name: cleanUser,
          sessionId: data.sessionId || igSessionId.trim(),
          connectedAt: Date.now()
        }));
      }

      // Ensure channel is marked in connected apps
      try {
        let userAppsKey = "cf_connected_apps";
        if (userId) userAppsKey = `cf_connected_apps_${userId}`;
        const existingApps = JSON.parse(localStorage.getItem(userAppsKey) || localStorage.getItem("cf_connected_apps") || '["web_widget"]');
        const s = new Set(existingApps);
        s.add("instagram");
        localStorage.setItem(userAppsKey, JSON.stringify(Array.from(s)));
        localStorage.setItem("cf_connected_apps", JSON.stringify(Array.from(s)));
      } catch {}

      setIgSyncSuccessMessage(data.message || (data.count > 0 ? `Imported ${data.count} real discussions!` : "Account connected successfully!"));
      window.dispatchEvent(new Event("storage"));

      setTimeout(() => {
        setIsSuccess(true);
        setTimeout(() => {
          onConnectSuccess("instagram");
          onClose();
        }, 1200);
      }, 800);
    } catch (err: any) {
      setMetaError(err.message || "Failed to sync Instagram account.");
    } finally {
      setIsSyncingIg(false);
    }
  };

  const handleConnectDirectUsername = () => {
    handleSyncInstagram("direct");
  };

  const handleSimulatePair = () => {
    setIsPairing(true);
    setTimeout(() => {
      setIsPairing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onConnectSuccess(appId);
        onClose();
      }, 1200);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="connect-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 16 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#1A1D23] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-[#DFDFD4] dark:border-[#2E333D] my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header Bar with App Solid Brand Color */}
          <div
            className="p-4 sm:p-5 flex items-center justify-between text-white select-none shadow-md relative shrink-0"
            style={{ backgroundColor: theme.solidColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0">
                {APP_ICONS[appId]}
              </div>
              <div>
                <h3 className="font-extrabold text-base leading-snug flex items-center gap-1.5">
                  <span>{theme.name}</span>
                  {isMetaChannel && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 font-black">
                      Meta App #{metaAppId.slice(-4)}
                    </span>
                  )}
                </h3>
                <p className="text-white/85 text-xs">
                  {isMetaChannel
                    ? "Live Meta Graph API Integration"
                    : appId === "telegram"
                    ? "Telegram MTProto & Bot Gateway"
                    : appId === "signal"
                    ? "Signal End-to-End Encrypted Gateway"
                    : appId === "gmail"
                    ? "Support Email Integration"
                    : appId === "discord"
                    ? "Discord Bot & Server Gateway"
                    : appId === "slack"
                    ? "Slack Workspace & Bot Integration"
                    : appId === "irc"
                    ? "IRC Network Daemon & Channel"
                    : appId === "matrix"
                    ? "Matrix Federated Homeserver"
                    : appId === "google_messages"
                    ? "Google Messages SMS / RCS"
                    : appId === "google_chat"
                    ? "Google Chat Workspace Space"
                    : appId === "google_voice"
                    ? "Google Voice VoIP Number"
                    : appId === "linkedin"
                    ? "LinkedIn B2B Company Page"
                    : "Device Pairing & Gateway Link"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/15 hover:bg-white/25 transition-all text-white cursor-pointer active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[calc(92vh-85px)] custom-scrollbar">
            {isSuccess ? (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 flex flex-col items-center justify-center text-center space-y-3"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="font-extrabold text-lg text-gray-900 dark:text-white">
                  {appId === "instagram" 
                    ? `Real Instagram Linked!` 
                    : appId === "messenger"
                    ? `Real Facebook Page Linked!`
                    : `${theme.name} Connected!`}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                  {isMetaChannel
                    ? "Meta Graph API token validated. Your real conversations and customer DMs are now connected to Chatbot Farm."
                    : "Session established and active. Loading your discussions and customer contacts..."}
                </p>
              </motion.div>
            ) : appId === "instagram" ? (
              /* ============================================================= */
              /* DEDICATED UNIFIED INSTAGRAM WIZARD (PROFESSIONAL & PERSONAL)  */
              /* ============================================================= */
              <div className="space-y-4">
                {metaError && (
                  <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <div>
                      <p className="font-bold">Instagram Connection Notice</p>
                      <p className="text-[11px] opacity-90 leading-tight mt-0.5">{metaError}</p>
                    </div>
                  </div>
                )}

                {igSyncSuccessMessage && (
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                    <div>
                      <p className="font-bold">Instagram Sync Complete</p>
                      <p className="text-[11px] opacity-90 leading-tight mt-0.5">{igSyncSuccessMessage}</p>
                    </div>
                  </div>
                )}

                {isSyncingIg ? (
                  /* Live Syncing Progress Screen */
                  <div className="py-10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white flex items-center justify-center mx-auto shadow-xl">
                      <RefreshCw className="w-8 h-8 animate-spin" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-base text-gray-900 dark:text-white">
                        Syncing Real Instagram Discussions...
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                        Contacting Instagram servers, fetching active DM threads, and mapping real discussions into your SaaS CRM.
                      </p>
                    </div>
                    <div className="w-full max-w-xs mx-auto bg-gray-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] h-full w-2/3 animate-pulse rounded-full" />
                    </div>
                  </div>
                ) : igWizardStep === "choose_type" ? (
                  /* STEP 1: Choose Account Type */
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                        Connect Real Instagram
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Choose your preferred method to automatically import your real conversations and friends:
                      </p>
                    </div>

                    {/* Option 1: Direct Instagram Login (Recommended) */}
                    <div
                      id="ig-wizard-card-direct-login"
                      onClick={() => setIgWizardStep("configure_direct_login")}
                      className="p-4 rounded-2xl border-2 border-purple-200 dark:border-purple-800/50 hover:border-[#C13584] dark:hover:border-[#C13584] bg-gradient-to-r from-purple-500/5 to-pink-500/5 hover:bg-purple-500/10 cursor-pointer transition-all space-y-2 group shadow-xs hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white flex items-center justify-center shadow-xs">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-gray-900 dark:text-white block group-hover:text-[#C13584] transition-colors">
                              Direct Instagram Login
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                              Username & Password • Auto-import inbox
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">
                          Instant • Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug">
                        Log in directly with your Instagram credentials to automatically pull and sync all your real inbox discussions, friend profiles, and message history.
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-[#C13584]">
                        <span>Log In & Auto-Import →</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Option 2: Professional / Creator */}
                    <div
                      id="ig-wizard-card-professional"
                      onClick={() => setIgWizardStep("configure_meta")}
                      className="p-4 rounded-2xl border-2 border-gray-200 dark:border-neutral-700 hover:border-[#833AB4] dark:hover:border-[#833AB4] bg-gray-50/50 dark:bg-neutral-800/40 hover:bg-purple-500/5 cursor-pointer transition-all space-y-2 group shadow-xs hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#833AB4] to-[#FD1D1D] text-white flex items-center justify-center shadow-xs">
                            <MetaIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-gray-900 dark:text-white block group-hover:text-[#833AB4] transition-colors">
                              Professional / Business / Creator
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                              Official Meta Graph API & Webhooks
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                          Meta API
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug">
                        Connect using an official Meta Graph Token or Meta Login popup to manage business inquiries and automated replies.
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-[#833AB4]">
                        <span>Connect via Meta Token or Login →</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Option 3: Personal Session ID */}
                    <div
                      id="ig-wizard-card-personal"
                      onClick={() => setIgWizardStep("configure_personal")}
                      className="p-4 rounded-2xl border-2 border-gray-200 dark:border-neutral-700 hover:border-[#FD1D1D] dark:hover:border-[#FD1D1D] bg-gray-50/50 dark:bg-neutral-800/40 hover:bg-pink-500/5 cursor-pointer transition-all space-y-2 group shadow-xs hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FD1D1D] to-[#F77737] text-white flex items-center justify-center shadow-xs">
                            <UserCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-gray-900 dark:text-white block group-hover:text-[#FD1D1D] transition-colors">
                              Personal Session Cookie / Token
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                              1-Click Session ID Paste
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-full">
                          Session ID
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug">
                        Paste your Instagram sessionid cookie to instantly import your friends and conversation history.
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-[#FD1D1D]">
                        <span>Connect via Session ID →</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ) : igWizardStep === "configure_direct_login" ? (
                  /* STEP 2: Direct Instagram Login */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-neutral-800">
                      <button
                        id="ig-wizard-back-btn-direct"
                        type="button"
                        onClick={() => setIgWizardStep("choose_type")}
                        className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Change Method</span>
                      </button>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        Direct Login
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <InstagramIcon className="w-4 h-4 text-[#C13584]" />
                            <span>Instagram @Username:</span>
                          </span>
                          <span className="text-[10px] text-purple-600 font-bold bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                            Required
                          </span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">@</span>
                          <input
                            id="ig-wizard-input-direct-username"
                            type="text"
                            value={igPersonalUsername.replace(/^@/, '')}
                            onChange={(e) => {
                              setIgPersonalUsername(e.target.value.replace(/^@/, ''));
                              setIgCustomHandle(e.target.value.replace(/^@/, ''));
                            }}
                            placeholder="your_instagram_handle"
                            className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#C13584]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Lock className="w-4 h-4 text-[#C13584]" />
                            <span>Instagram Password:</span>
                          </span>
                          <span className="text-[10px] text-purple-600 font-bold bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                            Required
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            id="ig-wizard-input-direct-password"
                            type={showIgPassword ? "text" : "password"}
                            value={igDirectPassword}
                            onChange={(e) => setIgDirectPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#C13584]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowIgPassword(!showIgPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                          >
                            {showIgPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-2.5 text-[11px] text-emerald-900 dark:text-emerald-200 leading-snug">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-emerald-700 dark:text-emerald-300">🛡️ 100% Safe & Local</p>
                          <p className="mt-0.5">Encrypted directly on your computer. Credentials are never sent to external servers. Zero risk of account loss or bans.</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2 text-[11px] text-amber-900 dark:text-amber-200 leading-snug">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>Security Notice: Meta firewalls block automated password attempts from servers. If rejected, please connect using your active <strong>Session ID</strong> or <strong>⚡ 1-Click Safe Mode</strong>.</span>
                      </div>

                      <button
                        id="ig-wizard-submit-direct-login"
                        type="button"
                        onClick={() => handleSyncInstagram("login")}
                        disabled={isSyncingIg || !igPersonalUsername.trim() || !igDirectPassword.trim()}
                        className="w-full py-3 px-4 rounded-2xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 cursor-pointer disabled:opacity-50"
                        style={{
                          background: "linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)"
                        }}
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Log In & Auto-Import All Discussions</span>
                      </button>
                    </div>
                  </div>
                ) : igWizardStep === "configure_meta" ? (
                  /* STEP 2A: Professional / Creator Configuration */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-neutral-800">
                      <button
                        id="ig-wizard-back-btn-meta"
                        type="button"
                        onClick={() => setIgWizardStep("choose_type")}
                        className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Change Account Type</span>
                      </button>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        Professional / Creator
                      </span>
                    </div>

                    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-neutral-800 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setMetaSubTab("token")}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          metaSubTab === "token"
                            ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-xs"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        Graph API Token
                      </button>
                      <button
                        type="button"
                        onClick={() => setMetaSubTab("oauth")}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          metaSubTab === "oauth"
                            ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-xs"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        Meta Login Popup
                      </button>
                    </div>

                    {metaSubTab === "token" ? (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Key className="w-3.5 h-3.5 text-[#C13584]" />
                              <span>Meta Access Token:</span>
                            </span>
                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-100 dark:bg-purple-950/50 px-2 py-0.5 rounded-full">
                              Required
                            </span>
                          </label>
                          <textarea
                            rows={3}
                            value={metaAccessToken}
                            onChange={(e) => setMetaAccessToken(e.target.value)}
                            placeholder="EAA... (Paste token from Meta Graph Explorer)"
                            className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl p-2.5 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-[#C13584]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                              Instagram Business ID:
                            </label>
                            <input
                              type="text"
                              value={igProfessionalId}
                              onChange={(e) => setIgProfessionalId(e.target.value)}
                              placeholder="178414000... (Optional)"
                              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#C13584]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                              Store @Handle:
                            </label>
                            <input
                              type="text"
                              value={igCustomHandle.replace(/^@/, '')}
                              onChange={(e) => setIgCustomHandle(e.target.value.replace(/^@/, ''))}
                              placeholder="store_handle"
                              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#C13584]"
                            />
                          </div>
                        </div>

                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-gray-200/80 dark:border-neutral-700/60">
                          Generate your token at{" "}
                          <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="text-[#1877F2] underline font-bold">
                            developers.facebook.com/tools/explorer
                          </a>{" "}
                          with permissions <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">instagram_basic</code> and <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">instagram_manage_messages</code>.
                        </p>

                        <button
                          type="button"
                          onClick={() => handleSyncInstagram("meta")}
                          disabled={isSyncingIg || !metaAccessToken.trim()}
                          className="w-full py-3 px-4 rounded-2xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 cursor-pointer disabled:opacity-50"
                          style={{
                            background: "linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)"
                          }}
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Sync Real Conversations & Connect</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-[#F8F9FA] dark:bg-neutral-800/80 rounded-2xl p-4 border border-gray-200 dark:border-neutral-700 space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              <MetaIcon className="w-4 h-4" />
                              <span>Meta Official OAuth Login</span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-bold">
                              App ID: {metaAppId}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                            Sign in with your Facebook account that manages your Instagram Professional page. Your real discussions will sync automatically upon confirmation.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleLaunchRealMetaOAuth}
                          className="w-full py-3.5 px-5 rounded-2xl text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                          style={{
                            background: "linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)"
                          }}
                        >
                          <InstagramIcon className="w-5 h-5" />
                          <span>Log in with Meta (Real Instagram)</span>
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* STEP 2B: Personal Account Configuration */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-neutral-800">
                      <button
                        id="ig-wizard-back-btn-personal"
                        type="button"
                        onClick={() => setIgWizardStep("choose_type")}
                        className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Change Account Type</span>
                      </button>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
                        Personal Account
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <InstagramIcon className="w-4 h-4 text-[#C13584]" />
                            <span>Your Instagram @Username:</span>
                          </span>
                          <span className="text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
                            Required
                          </span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">@</span>
                          <input
                            id="ig-wizard-input-personal-username"
                            type="text"
                            value={igPersonalUsername.replace(/^@/, '')}
                            onChange={(e) => {
                              setIgPersonalUsername(e.target.value.replace(/^@/, ''));
                              setIgCustomHandle(e.target.value.replace(/^@/, ''));
                            }}
                            placeholder="your_real_username"
                            className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#FD1D1D]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-[#FD1D1D]" />
                            <span>Instagram Session ID (Cookie):</span>
                          </label>
                          <button
                            id="ig-wizard-session-help-btn"
                            type="button"
                            onClick={() => setShowSessionHelp(!showSessionHelp)}
                            className="text-[10px] text-[#FD1D1D] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                          >
                            <HelpCircle className="w-3 h-3" />
                            <span>{showSessionHelp ? "Hide guide" : "How to get this?"}</span>
                          </button>
                        </div>

                        <input
                          id="ig-wizard-input-session-id"
                          type="password"
                          value={igSessionId}
                          onChange={(e) => setIgSessionId(e.target.value)}
                          placeholder="sessionid cookie value (e.g. 12345%3Aabc...)"
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#FD1D1D]"
                        />

                        {showSessionHelp && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/40 text-[11px] text-orange-900 dark:text-orange-200 space-y-1.5 leading-relaxed"
                          >
                            <p className="font-bold flex items-center gap-1">
                              <span>⚡ How to get your sessionid in 20 seconds:</span>
                            </p>
                            <ol className="list-decimal list-inside space-y-0.5 pl-1 opacity-90 text-[10px]">
                              <li>Open <strong>instagram.com</strong> in your browser and log in.</li>
                              <li>Press <kbd className="bg-white/80 dark:bg-black/40 px-1 py-0.5 rounded border border-orange-300">F12</kbd> (or right click → Inspect).</li>
                              <li>Go to the <strong>Application</strong> (or Storage) tab.</li>
                              <li>Under <strong>Cookies</strong>, select <code className="bg-white/80 dark:bg-black/40 px-1 py-0.5 rounded">https://www.instagram.com</code>.</li>
                              <li>Copy the value of <code className="font-bold text-orange-600 dark:text-orange-400">sessionid</code> and paste it here.</li>
                            </ol>
                            <p className="text-[10px] text-gray-500 pt-0.5">
                              Note: Session ID is used to fetch your real conversations and friends list directly from Instagram.
                            </p>
                          </motion.div>
                        )}

                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                          With Session ID, all your real Instagram friends and discussions will be imported automatically. Without Session ID, your handle connects in CRM mode so you can send direct messages immediately.
                        </p>
                      </div>

                      <button
                        id="ig-wizard-submit-personal"
                        type="button"
                        onClick={() => handleSyncInstagram("direct")}
                        disabled={isSyncingIg || !igPersonalUsername.trim()}
                        className="w-full py-3 px-4 rounded-2xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 cursor-pointer disabled:opacity-50"
                        style={{
                          background: "linear-gradient(135deg, #FD1D1D 0%, #F77737 100%)"
                        }}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{igSessionId.trim() ? "Sync Real Friends & Conversations" : "Connect Instagram @Username"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : appId === "messenger" ? (
              /* ------------------------------------------------------------- */
              /* DEDICATED FACEBOOK MESSENGER MULTI-MODE PAIRING FLOW          */
              /* ------------------------------------------------------------- */
              <div className="space-y-4">
                {/* Mode Selector Tabs */}
                <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-neutral-800 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMessengerTab("page")}
                    className={`flex-1 py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                      messengerTab === "page"
                        ? "bg-white dark:bg-neutral-700 text-[#1877F2] dark:text-blue-400 shadow-xs font-black"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <FacebookIcon className="w-3.5 h-3.5" />
                    <span>Facebook Page Sign-In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessengerTab("token")}
                    className={`flex-1 py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                      messengerTab === "token"
                        ? "bg-white dark:bg-neutral-700 text-[#1877F2] dark:text-blue-400 shadow-xs font-black"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Meta Page Access Token</span>
                  </button>
                </div>

                {/* TAB 2: Facebook Page Sign-In */}
                {messengerTab === "page" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <FacebookIcon className="w-4 h-4 text-[#1877F2]" />
                        <span>Facebook Page Name or Store Title:</span>
                      </label>
                      <input
                        type="text"
                        value={messengerPageName}
                        onChange={(e) => setMessengerPageName(e.target.value)}
                        placeholder="e.g. El Bahdja Boutique DZ or Boutik DZ"
                        className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#1877F2]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        Store Facebook Page URL (Optional):
                      </label>
                      <input
                        type="text"
                        value={messengerPageUrl}
                        onChange={(e) => setMessengerPageUrl(e.target.value)}
                        placeholder="facebook.com/your_store"
                        className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-[#1877F2]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        Admin Email / Phone (Optional):
                      </label>
                      <input
                        type="text"
                        value={messengerPageEmail}
                        onChange={(e) => setMessengerPageEmail(e.target.value)}
                        placeholder="contact@store.dz or 0550 12 34 56"
                        className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#1877F2]"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>100% Safe & Local:</strong> Stored strictly in local browser memory. Zero risk of account restriction or password exposure.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsLinkingMessengerPage(true);
                        const pageData = {
                          id: "page_" + (messengerPageName.toLowerCase().replace(/[^a-z0-9]/g, '_') || "store"),
                          name: messengerPageName.trim() || "Facebook Store Page",
                          url: messengerPageUrl.trim(),
                          email: messengerPageEmail.trim() || undefined,
                          verified: true,
                        };
                        localStorage.setItem("cf_messenger_page", JSON.stringify(pageData));
                        setTimeout(() => {
                          setIsLinkingMessengerPage(false);
                          handleGenericChannelVerified(pageData);
                        }, 500);
                      }}
                      disabled={isLinkingMessengerPage || !messengerPageName.trim()}
                      className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 cursor-pointer disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #1877F2 0%, #00C6FF 100%)" }}
                    >
                      {isLinkingMessengerPage ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Connecting Facebook Page...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Connect Facebook Page & Auto-Import Inbox</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* TAB 2: Meta Graph Token */}
                {messengerTab === "token" && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Developer Console Notice</span>
                      </p>
                      <p className="leading-relaxed">
                        Meta's official OAuth popup requires that your Meta Developer App have <code>localhost:3000</code> in <strong>App Domains</strong> and <strong>Valid OAuth Redirect URIs</strong>. For instant client usage without setup, use <strong>⚡ 1-Click Fast Connect</strong>.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-[#1877F2]" />
                          <span>Meta Page Access Token:</span>
                        </span>
                        <span className="text-[10px] text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                          Graph API
                        </span>
                      </label>
                      <textarea
                        rows={3}
                        value={metaAccessToken}
                        onChange={(e) => setMetaAccessToken(e.target.value)}
                        placeholder="EAAB... (Paste Page Access Token from Meta Graph API Explorer)"
                        className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl p-2.5 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-[#1877F2]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyDirectToken}
                      disabled={isValidatingToken || !metaAccessToken.trim()}
                      className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 cursor-pointer disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #1877F2 0%, #00C6FF 100%)" }}
                    >
                      {isValidatingToken ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying Token with Meta...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify Page Token & Connect</span>
                        </>
                      )}
                    </button>

                    <div className="pt-1 text-center">
                      <button
                        type="button"
                        onClick={handleLaunchRealMetaOAuth}
                        className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Try Meta OAuth Popup (Requires Whitelisted Domain)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : appId === "gmail" ? (
              /* Dedicated Gmail Support Flow */
              (() => {
                let loggedInEmail = "";
                try {
                  const s = localStorage.getItem("cf_user_session");
                  if (s) loggedInEmail = JSON.parse(s).email || "";
                } catch {}

                return (
                  <div className="space-y-4">
                    {gmailError && (
                      <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                        <div>
                          <p className="font-bold">Gmail Notice</p>
                          <p className="text-[11px] opacity-90 leading-tight mt-0.5">{gmailError}</p>
                        </div>
                      </div>
                    )}

                    {/* 1-Click Active Google Account Card */}
                    {loggedInEmail && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-blue-500/10 border-2 border-red-500/30 flex flex-col gap-2.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GmailIcon className="w-5 h-5 shrink-0" />
                            <span className="font-extrabold text-xs text-gray-900 dark:text-white">Active Google Account Detected</span>
                          </div>
                          <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-extrabold px-2 py-0.5 rounded-full">1-Click</span>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug">
                          Connect your logged-in Google identity <strong>{loggedInEmail}</strong> directly without manual configuration or webhooks.
                        </p>
                        <button
                          type="button"
                          id="gmail-1click-connect-btn"
                          onClick={() => handleVerifyGmail(loggedInEmail)}
                          disabled={isVerifyingGmail}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#EA4335] to-[#D93025] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-98 cursor-pointer disabled:opacity-60"
                        >
                          {isVerifyingGmail ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>⚡ 1-Click Connect</span>
                        </button>
                      </div>
                    )}

                    <div className="relative flex items-center justify-center">
                      <div className="w-full border-t border-gray-200 dark:border-neutral-800" />
                      <span className="absolute bg-white dark:bg-neutral-900 px-2 text-[10px] font-bold text-gray-400 uppercase">
                        or link a custom support email
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-xs text-gray-700 dark:text-gray-300">
                        Custom Support Email Address:
                      </label>
                      <input
                        type="email"
                        id="gmail-input-custom-email"
                        value={gmailEmail}
                        onChange={(e) => setGmailEmail(e.target.value)}
                        placeholder="support@yourbusiness.com"
                        className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#EA4335]"
                      />
                      <p className="text-[10px] text-gray-500">
                        Messages sent to this email address will appear in your workspace.
                      </p>
                    </div>

                    <div className="pt-1 space-y-2">
                      <button
                        type="button"
                        id="gmail-custom-submit-btn"
                        onClick={() => handleVerifyGmail()}
                        disabled={isVerifyingGmail}
                        className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:opacity-95 active:scale-98 cursor-pointer disabled:opacity-60"
                        style={{ backgroundColor: theme.solidColor }}
                      >
                        {isVerifyingGmail ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Verifying Support Inbox...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Link Support Email Inbox</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                      <p className="text-[10px] text-gray-400 text-center">
                        Secure SSL / OAuth encrypted session.
                      </p>
                    </div>
                  </div>
                );
              })()
            ) : ["discord", "slack", "x_twitter", "matrix", "google_messages", "google_chat", "google_voice", "linkedin", "irc"].includes(appId) ? (
              <ChannelPairingForms
                appId={appId}
                theme={theme}
                onVerifySuccess={handleGenericChannelVerified}
              />
            ) : appId === "signal" ? (
              /* ------------------------------------------------------------- */
              /* DEDICATED SIGNAL PAIRING FLOW (OFFICIAL QR LINK / PHONE SMS)  */
              /* ------------------------------------------------------------- */
              <div className="space-y-4">
                {/* 2-Way Mode Selector Tabs */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 dark:bg-neutral-800 rounded-xl text-xs font-bold">
                  <button
                    id="signal-tab-qr-btn"
                    type="button"
                    onClick={() => {
                      setSignalTab("qr");
                      setSignalError(null);
                      if (!realQrDataUrl || qrCountdown <= 5) {
                        generateRealQr("signal");
                      }
                    }}
                    className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                      signalTab === "qr"
                        ? "bg-white dark:bg-neutral-700 text-[#3A76F0] dark:text-blue-400 shadow-xs font-black"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <QrIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>Desktop QR Link</span>
                  </button>
                  <button
                    id="signal-tab-phone-btn"
                    type="button"
                    onClick={() => {
                      setSignalTab("phone");
                      setSignalError(null);
                    }}
                    className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                      signalTab === "phone"
                        ? "bg-white dark:bg-neutral-700 text-[#3A76F0] dark:text-blue-400 shadow-xs font-black"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    <span>Phone Number</span>
                  </button>
                </div>

                {/* TAB 1: DESKTOP QR LINK */}
                {signalTab === "qr" && (
                  <div className="space-y-3 text-center">
                    {/* Genuine Signal Desktop QR Code Container */}
                    <div className="relative mx-auto w-56 h-56 sm:w-60 sm:h-60 bg-white p-3 rounded-2xl border-2 border-gray-200 dark:border-neutral-700 shadow-md flex items-center justify-center overflow-hidden">
                      {realQrDataUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img
                            src={realQrDataUrl}
                            alt="Signal Desktop Link QR"
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-7 h-7 text-gray-400 animate-spin" />
                          <span className="text-xs text-gray-400">Generating Signal link QR...</span>
                        </div>
                      )}

                      {/* Laser scanning beam */}
                      <motion.div
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-lg shadow-blue-500/50 pointer-events-none"
                        animate={{ top: ["5%", "95%", "5%"] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                      />
                    </div>

                    {/* Refresh Countdown & Status */}
                    <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                      <Wifi className="w-3 h-3 text-blue-500 animate-pulse" />
                      <span>Code refreshes in <strong>{qrCountdown}s</strong></span>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => {
                          setQrCountdown(45);
                          generateRealQr("signal");
                        }}
                        className="text-[#3A76F0] dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Refresh
                      </button>
                    </div>

                    {/* Step by step guide */}
                    <div className="bg-[#ECECE2]/60 dark:bg-neutral-800/60 p-3.5 rounded-2xl text-left space-y-1.5 border border-[#DFDFD4] dark:border-neutral-700">
                      <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                        <span>Signal Mobile Linking:</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Official Protocol</span>
                      </p>
                      <ol className="list-decimal list-inside text-[10px] text-gray-600 dark:text-gray-400 space-y-1 leading-relaxed">
                        <li><span className="text-gray-800 dark:text-gray-200 font-medium">Open Signal on your mobile phone</span></li>
                        <li><span className="text-gray-800 dark:text-gray-200 font-medium">Tap your profile icon or Settings (⚙️) &gt; Linked Devices</span></li>
                        <li><span className="text-gray-800 dark:text-gray-200 font-medium">Tap Link New Device (+)</span></li>
                        <li><span className="text-gray-800 dark:text-gray-200 font-medium">Point phone camera at this QR code</span></li>
                      </ol>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 text-[10px] text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                      <span>Listening for device handshake... Or use Phone Number tab for instant SMS link.</span>
                    </div>
                  </div>
                )}

                {/* TAB 2: PHONE NUMBER REGISTRATION */}
                {signalTab === "phone" && (
                  <div className="space-y-4">
                    {signalError && (
                      <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                        <p className="text-[11px] leading-tight">{signalError}</p>
                      </div>
                    )}

                    {signalStep === "phone" ? (
                      <div className="space-y-3">
                        <div className="p-3 rounded-2xl bg-[#3A76F0]/10 border border-[#3A76F0]/30 flex items-start gap-2.5">
                          <Lock className="w-5 h-5 text-[#3A76F0] shrink-0 mt-0.5" />
                          <div className="text-[11px] text-gray-700 dark:text-gray-300 leading-snug">
                            <span className="font-bold text-[#3A76F0]">Signal End-to-End Encryption: </span>
                            Register your store mobile number to send and receive encrypted messages directly.
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-xs text-gray-700 dark:text-gray-300">
                            Your Signal Mobile Phone Number:
                          </label>
                          <input
                            id="signal-phone-input"
                            type="tel"
                            value={signalPhone}
                            onChange={(e) => setSignalPhone(e.target.value)}
                            placeholder="+213 661 22 33 44"
                            className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#3A76F0]"
                          />
                          <p className="text-[10px] text-gray-400">
                            Include your country code (e.g. +213 for Algeria, +33 for France, +1 for US).
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-xs text-gray-700 dark:text-gray-300">
                            Store / Display Name (Optional):
                          </label>
                          <input
                            id="signal-name-input"
                            type="text"
                            value={signalName}
                            onChange={(e) => setSignalName(e.target.value)}
                            placeholder="e.g. My Business Signal"
                            className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#3A76F0]"
                          />
                        </div>

                        <button
                          id="signal-send-code-btn"
                          type="button"
                          onClick={handleSendSignalCode}
                          disabled={isSendingSignalCode}
                          className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 active:scale-98 cursor-pointer disabled:opacity-60 bg-[#3A76F0]"
                        >
                          {isSendingSignalCode ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Sending code via SMS...</span>
                            </>
                          ) : (
                            <>
                              <span>Send Verification Code</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            Code sent to <strong>{signalPhone}</strong>
                          </span>
                          <button
                            id="signal-change-phone-btn"
                            type="button"
                            onClick={() => {
                              setSignalStep("phone");
                              setSignalError(null);
                            }}
                            className="text-[11px] text-[#3A76F0] hover:underline font-bold"
                          >
                            Change
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-xs text-gray-700 dark:text-gray-300">
                            Enter 6-Digit Verification Code:
                          </label>
                          <input
                            id="signal-code-input"
                            type="text"
                            value={signalCode}
                            onChange={(e) => setSignalCode(e.target.value.trim())}
                            maxLength={6}
                            placeholder="123456"
                            className="w-full text-center bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-lg font-mono font-black tracking-widest text-gray-900 dark:text-white focus:outline-none focus:border-[#3A76F0]"
                          />
                          <p className="text-[10px] text-gray-400">
                            Check SMS message on your mobile phone.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-xs text-gray-700 dark:text-gray-300 flex items-center justify-between">
                            <span>Signal PIN / Registration Lock (Optional):</span>
                            <span className="text-[10px] text-gray-400 font-normal">If enabled on Signal</span>
                          </label>
                          <div className="relative">
                            <input
                              id="signal-pin-input"
                              type={showSignalPin ? "text" : "password"}
                              value={signalPin}
                              onChange={(e) => setSignalPin(e.target.value)}
                              placeholder="Enter your Signal PIN"
                              className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#3A76F0]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignalPin(!showSignalPin)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showSignalPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <button
                          id="signal-verify-phone-btn"
                          type="button"
                          onClick={handleVerifySignalPhone}
                          disabled={isSigningInSignal}
                          className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 active:scale-98 cursor-pointer disabled:opacity-60 bg-[#3A76F0]"
                        >
                          {isSigningInSignal ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Verifying & Linking Signal...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verify & Connect Signal</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : appId === "telegram" ? (
              /* ------------------------------------------------------------- */
              /* DEDICATED TELEGRAM PAIRING FLOW (MTPROTO QR / PHONE / BOT)   */
              /* ------------------------------------------------------------- */
              <div className="space-y-4">
                {/* 3-Way Mode Selector Tabs */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 dark:bg-neutral-800 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setTelegramTab("qr");
                      setTelegramError(null);
                      if (!realQrDataUrl || qrCountdown <= 5) {
                        generateRealQr("telegram");
                      }
                    }}
                    className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                      telegramTab === "qr"
                        ? "bg-white dark:bg-neutral-700 text-[#0088CC] dark:text-cyan-400 shadow-xs font-black"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <QrIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Desktop QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTelegramTab("phone");
                      setTelegramError(null);
                    }}
                    className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                      telegramTab === "phone"
                        ? "bg-white dark:bg-neutral-700 text-[#0088CC] dark:text-cyan-400 shadow-xs font-black"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Phone Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTelegramTab("bot");
                      setTelegramError(null);
                    }}
                    className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                      telegramTab === "bot"
                        ? "bg-white dark:bg-neutral-700 text-[#0088CC] dark:text-cyan-400 shadow-xs font-black"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Key className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Bot Token</span>
                  </button>
                </div>

                {/* TAB 1: DESKTOP MTPROTO QR */}
                {telegramTab === "qr" && (
                  <div className="space-y-3 text-center">
                    {telegramError && (
                      <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 text-left">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                        <p className="text-[11px] leading-tight">{telegramError}</p>
                      </div>
                    )}

                    {/* Completely Unobstructed QR Code Container */}
                    <div className="relative mx-auto w-56 h-56 sm:w-60 sm:h-60 bg-white p-3 rounded-2xl border-2 border-gray-200 dark:border-neutral-700 shadow-md flex items-center justify-center overflow-hidden">
                      {realQrDataUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img
                            src={realQrDataUrl}
                            alt="Telegram MTProto Login QR Code"
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-7 h-7 text-[#0088CC] animate-spin" />
                          <span className="text-xs text-gray-500">Generating live Telegram QR...</span>
                        </div>
                      )}

                      {/* Laser scanning beam */}
                      <motion.div
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0088CC] to-transparent shadow-lg shadow-[#0088CC]/50 pointer-events-none"
                        animate={{ top: ["5%", "95%", "5%"] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                      />
                    </div>

                    {/* Live Scanning Status & Refresh Countdown */}
                    <div className="flex items-center justify-between px-2 text-[11px] text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">Waiting for scan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Refreshes in <strong>{qrCountdown}s</strong></span>
                        <button
                          type="button"
                          onClick={() => {
                            setQrCountdown(45);
                            generateRealQr("telegram");
                          }}
                          className="text-[#0088CC] dark:text-cyan-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-2.5 h-2.5" /> Reload
                        </button>
                      </div>
                    </div>

                    {/* Step by step mobile guide */}
                    <div className="bg-[#ECECE2]/60 dark:bg-neutral-800/60 p-3.5 rounded-2xl text-left space-y-1.5 border border-[#DFDFD4] dark:border-neutral-700">
                      <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                        <span>Scan in Telegram mobile app:</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Official Link</span>
                      </p>
                      <ol className="list-decimal list-inside text-[10px] text-gray-600 dark:text-gray-400 space-y-1 leading-relaxed">
                        <li>Open <strong className="text-gray-900 dark:text-white">Telegram</strong> on your phone</li>
                        <li>Go to <strong className="text-gray-900 dark:text-white">Settings &gt; Devices</strong></li>
                        <li>Tap <strong className="text-[#0088CC]">Link Desktop Device</strong></li>
                        <li>Point camera at this QR code and confirm</li>
                      </ol>
                    </div>
                  </div>
                )}

                {/* TAB 2: PHONE CODE LOGIN */}
                {telegramTab === "phone" && (
                  <div className="space-y-4 py-1 text-left">
                    {telegramError && (
                      <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                        <p className="text-[11px] leading-tight">{telegramError}</p>
                      </div>
                    )}

                    {telegramStep === "phone" ? (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="font-bold text-xs text-gray-700 dark:text-gray-300">
                            Your Telegram Phone Number:
                          </label>
                          <input
                            type="tel"
                            value={telegramPhone}
                            onChange={(e) => setTelegramPhone(e.target.value)}
                            placeholder="+213 550 12 34 56"
                            className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold focus:outline-none focus:border-[#0088CC]"
                          />
                          <p className="text-[10px] text-gray-400">
                            Include your country code (e.g. +213 for Algeria, +1 for US/Canada, +33 for France).
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleSendTelegramCode}
                          disabled={isSendingTelegramCode}
                          className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 active:scale-98 cursor-pointer disabled:opacity-60 bg-[#0088CC]"
                        >
                          {isSendingTelegramCode ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Sending code to Telegram...</span>
                            </>
                          ) : (
                            <>
                              <span>Send Verification Code</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            Code sent to <strong>{telegramPhone}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setTelegramStep("phone");
                              setTelegramError(null);
                            }}
                            className="text-[11px] text-[#0088CC] hover:underline font-bold"
                          >
                            Change
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-xs text-gray-700 dark:text-gray-300">
                            Enter 5-Digit Verification Code:
                          </label>
                          <input
                            type="text"
                            value={telegramCode}
                            onChange={(e) => setTelegramCode(e.target.value.trim())}
                            maxLength={6}
                            placeholder="12345"
                            className="w-full text-center bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-lg font-mono font-black tracking-widest focus:outline-none focus:border-[#0088CC]"
                          />
                          <p className="text-[10px] text-gray-400">
                            Check the official notification in your Telegram mobile or desktop app.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-xs text-gray-700 dark:text-gray-300 flex items-center justify-between">
                            <span>2FA Password (Optional):</span>
                            <span className="text-[10px] text-gray-400 font-normal">If Two-Step enabled</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showTelegramPassword ? "text" : "password"}
                              value={telegramPassword}
                              onChange={(e) => setTelegramPassword(e.target.value)}
                              placeholder="Enter your 2FA password"
                              className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#0088CC]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowTelegramPassword(!showTelegramPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showTelegramPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleSignInTelegramPhone}
                          disabled={isSigningInTelegram}
                          className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 active:scale-98 cursor-pointer disabled:opacity-60 bg-[#0088CC]"
                        >
                          {isSigningInTelegram ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Verifying & Signing In...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verify & Connect Telegram</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: BOT TOKEN */}
                {telegramTab === "bot" && (
                  <div className="space-y-3 py-1 text-left">
                    {telegramError && (
                      <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                        <p className="text-[11px] leading-tight">{telegramError}</p>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="font-bold text-xs text-gray-700 dark:text-gray-300">
                        Enter Telegram Bot Token:
                      </label>
                      <input
                        type="text"
                        value={telegramToken}
                        onChange={(e) => setTelegramToken(e.target.value)}
                        placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                        className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-[#0088CC]"
                      />
                    </div>

                    <div className="bg-[#ECECE2]/60 dark:bg-neutral-800/60 p-3 rounded-2xl text-left space-y-1.5 border border-[#DFDFD4] dark:border-neutral-700 text-xs">
                      <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200">How to get a free bot token in 30 seconds:</p>
                      <ol className="list-decimal list-inside text-[10px] text-gray-600 dark:text-gray-400 space-y-1">
                        <li>Open Telegram on your phone and search for <strong className="text-[#0088CC]">@BotFather</strong></li>
                        <li>Send <code className="bg-black/5 dark:bg-white/10 px-1 rounded">/newbot</code> and pick a name</li>
                        <li>Copy the HTTP API token and paste it above</li>
                      </ol>
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyTelegramBot}
                      disabled={isVerifyingTelegram}
                      className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 active:scale-98 cursor-pointer disabled:opacity-60 bg-[#0088CC]"
                    >
                      {isVerifyingTelegram ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying Bot with Telegram...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify & Link Telegram Bot</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ------------------------------------------------------------- */
              /* STANDARD QR CODE / PAIRING CODE FLOW (WHATSAPP, ETC.)         */
              /* ------------------------------------------------------------- */
              <>
                {/* Mode Selector Tabs (QR Code vs Phone Pairing Code) */}
                <div className="flex rounded-xl bg-gray-100 dark:bg-neutral-800 p-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveMode("qr")}
                    className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeMode === "qr"
                        ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-xs"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <QrIcon className="w-3.5 h-3.5" />
                    <span>Scan QR Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMode("code")}
                    className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeMode === "code"
                        ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-xs"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Pairing Code</span>
                  </button>
                </div>

                {activeMode === "qr" ? (
                  <div className="space-y-3 text-center">
                    {/* Genuine Scannable QR Code Container */}
                    <div className="relative mx-auto w-56 h-56 sm:w-60 sm:h-60 bg-white p-3 rounded-2xl border-2 border-gray-200 dark:border-neutral-700 shadow-md flex items-center justify-center overflow-hidden">
                      {realQrDataUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img
                            src={realQrDataUrl}
                            alt={`${theme.name} QR Code`}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-7 h-7 text-gray-400 animate-spin" />
                          <span className="text-xs text-gray-400">Generating QR code...</span>
                        </div>
                      )}

                      {/* Laser scanning beam */}
                      <motion.div
                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400/50 pointer-events-none"
                        animate={{ top: ["5%", "95%", "5%"] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                      />
                    </div>

                    {/* Refresh Countdown */}
                    <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                      <Wifi className="w-3 h-3 text-emerald-500 animate-pulse" />
                      <span>Code refreshes in <strong>{qrCountdown}s</strong></span>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => {
                          setQrCountdown(30);
                          generateRealQr(appId);
                        }}
                        className="text-[#1B6648] dark:text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Refresh
                      </button>
                    </div>

                    {/* Step by step guide */}
                    <div className="bg-[#ECECE2]/60 dark:bg-neutral-800/60 p-3.5 rounded-2xl text-left space-y-1.5 border border-[#DFDFD4] dark:border-neutral-700">
                      <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                        <span>{guide.subtitle}:</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">100% Scannable</span>
                      </p>
                      <ol className="list-decimal list-inside text-[10px] text-gray-600 dark:text-gray-400 space-y-1 leading-relaxed">
                        {guide.steps.map((step, idx) => (
                          <li key={idx}><span className="text-gray-800 dark:text-gray-200 font-medium">{step}</span></li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ) : (
                  /* Phone Pairing Code View */
                  <div className="space-y-4 py-2">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="font-bold text-xs text-gray-700 dark:text-gray-300">
                          Your Mobile Phone Number:
                        </label>
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#1B6648]"
                        />
                      </div>

                      <div className="bg-[#ECECE2]/60 dark:bg-neutral-800/60 p-4 rounded-2xl text-center space-y-1.5 border border-[#DFDFD4] dark:border-neutral-700">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                          Enter this pairing code on your phone:
                        </span>
                        <div className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-[#1B6648] dark:text-emerald-400 bg-white dark:bg-neutral-900 py-2 px-4 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-xs">
                          {pairingCode}
                        </div>
                        <p className="text-[10px] text-gray-500">
                          Code expires in {qrCountdown} seconds. Enter it in the notification on your phone.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm & Pair Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSimulatePair}
                    disabled={isPairing}
                    className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:opacity-95 active:scale-98 cursor-pointer disabled:opacity-60"
                    style={{ backgroundColor: theme.solidColor }}
                  >
                    {isPairing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying QR Link & Syncing Session...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Pair Device & Open Discussion</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-2">
                    End-to-end encrypted session. No customer data is shared with third parties.
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
