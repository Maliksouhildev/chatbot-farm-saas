import React from 'react';

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="24" fill="#25D366" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M34.5 13.5C31.7 10.7 28 9.2 24 9.2C15.8 9.2 9.2 15.8 9.2 24C9.2 26.6 9.9 29.2 11.2 31.4L9 39.5L17.3 37.3C19.4 38.5 21.7 39.1 24 39.1C32.2 39.1 38.8 32.5 38.8 24.3C38.8 20.3 37.3 16.3 34.5 13.5ZM24 36.6C21.9 36.6 19.9 36 18.1 35L17.6 34.7L12.7 36L14 31.2L13.7 30.7C12.5 28.7 11.8 26.4 11.8 24C11.8 17.3 17.3 11.8 24 11.8C27.3 11.8 30.3 13.1 32.6 15.4C34.9 17.7 36.2 20.8 36.2 24C36.2 30.7 30.7 36.6 24 36.6ZM30.7 27.2C30.3 27 28.5 26.1 28.1 26C27.8 25.9 27.5 25.8 27.3 26.2C27.1 26.5 26.4 27.3 26.2 27.5C26 27.8 25.8 27.8 25.4 27.6C25 27.4 23.8 27 22.4 25.8C21.3 24.8 20.6 23.6 20.4 23.2C20.2 22.8 20.4 22.6 20.6 22.4C20.8 22.2 21 22 21.2 21.8C21.4 21.6 21.4 21.4 21.5 21.2C21.6 21 21.6 20.8 21.5 20.6C21.4 20.4 20.7 18.7 20.4 18C20.1 17.3 19.8 17.4 19.6 17.4C19.4 17.4 19.2 17.4 18.9 17.4C18.7 17.4 18.3 17.5 18 17.8C17.7 18.1 16.8 19 16.8 20.8C16.8 22.6 18.1 24.3 18.3 24.6C18.5 24.8 20.8 28.4 24.5 30C25.4 30.4 26.1 30.6 26.7 30.8C27.6 31.1 28.4 31 29 30.9C29.8 30.8 31.3 30 31.6 29.1C31.9 28.2 31.9 27.5 31.8 27.3C31.7 27.3 31.1 27.4 30.7 27.2Z"
      fill="white"
    />
  </svg>
);

export const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div
    className={`${className} rounded-xl flex items-center justify-center text-white shrink-0 overflow-hidden shadow-xs`}
    style={{
      background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
    }}
  >
    <svg className="w-[68%] h-[68%]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.8" />
    </svg>
  </div>
);

export const TelegramIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="24" fill="#24A1DE" />
    <path
      d="M11 23.5L34.5 13.5L30 35.5L22.5 28.5L18.5 32L19.2 26.8L31.5 17.5L16.2 24.8L11 23.5Z"
      fill="white"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);

export const MessengerIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div
    className={`${className} rounded-full flex items-center justify-center text-white shrink-0 overflow-hidden shadow-xs`}
    style={{
      background: 'linear-gradient(135deg, #00B2FE 0%, #006AFF 50%, #9B00E8 100%)',
    }}
  >
    <svg className="w-[62%] h-[62%]" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.915 1.455 5.518 3.734 7.207v3.535l3.39-1.861c.905.251 1.87.387 2.876.387 5.523 0 10-4.145 10-9.268C22 6.145 17.523 2 12 2zm1.09 12.443l-2.548-2.718-4.97 2.718 5.467-5.802 2.612 2.718 4.907-2.718-5.468 5.802z" />
    </svg>
  </div>
);

export const StorefrontIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={className + ' rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm'}>
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  </div>
);

export const GmailIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="white" />
    <path d="M11 34V18.2L24 27L37 18.2V34C37 35.1 36.1 36 35 36H13C11.9 36 11 35.1 11 34Z" fill="#EA4335" />
    <path d="M37 15.5V18.2L24 27L11 18.2V15.5C11 14.1 12.6 13.2 13.8 14L24 20.8L34.2 14C35.4 13.2 37 14.1 37 15.5Z" fill="#C5221F" />
    <path d="M37 18.2V34C37 35.1 36.1 36 35 36H33V18.2L37 15.5Z" fill="#FBBC04" />
    <path d="M11 18.2V34C11 35.1 11.9 36 13 36H15V18.2L11 15.5Z" fill="#4285F4" />
  </svg>
);

export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="24" fill="#1877F2" />
    <path
      d="M29.5 25H25.5V37H20.5V25H18V20.5H20.5V17.5C20.5 15.2 21.8 13 25.5 13C27.1 13 28.5 13.2 28.5 13.2V17.2H27C25.6 17.2 25.5 17.9 25.5 19V20.5H29.8L29.5 25Z"
      fill="white"
    />
  </svg>
);

export const MetaIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.92 5.06c-1.7 0-3.17.9-4.04 2.22-.88-1.32-2.35-2.22-4.05-2.22C5.39 5.06 3 7.82 3 11.23c0 4.19 3.48 7.71 7.23 7.71 1.76 0 3.23-.74 4.09-1.84.86 1.1 2.33 1.84 4.09 1.84 3.75 0 7.23-3.52 7.23-7.71 0-3.41-2.39-6.17-5.72-6.17zm-8.09 11.4c-2.36 0-4.71-2.42-4.71-5.23 0-2.18 1.48-4.04 3.55-4.04 1.73 0 3.12 1.39 3.51 3.27l.08.38c-.7 1.94-1.57 4.19-2.43 5.62zm8.26 0c-.86-1.43-1.73-3.68-2.43-5.62l.08-.38c.39-1.88 1.78-3.27 3.51-3.27 2.07 0 3.55 1.86 3.55 4.04 0 2.81-2.35 5.23-4.71 5.23z"
      fill="#0064E0"
    />
  </svg>
);

export const SignalIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`${className} rounded-xl bg-[#3A76F0] flex items-center justify-center text-white shrink-0 overflow-hidden shadow-xs`}>
    <svg className="w-[70%] h-[70%]" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 2.05.62 3.96 1.69 5.55L2.35 21.2a1 1 0 001.21 1.21l3.65-1.34C8.8 21.6 10.36 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.48 0-2.88-.38-4.11-1.04l-.29-.16-2.58.95.95-2.58-.16-.29A7.95 7.95 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
      <circle cx="12" cy="12" r="3.5" fill="white" />
    </svg>
  </div>
);

export const XIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`${className} rounded-xl bg-black flex items-center justify-center text-white shrink-0 overflow-hidden shadow-xs border border-white/10`}>
    <svg className="w-[60%] h-[60%]" viewBox="0 0 24 24" fill="white">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  </div>
);

export const GoogleMessagesIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`${className} rounded-xl bg-gradient-to-tr from-[#1A73E8] to-[#4285F4] flex items-center justify-center text-white shrink-0 overflow-hidden shadow-xs`}>
    <svg className="w-[65%] h-[65%]" viewBox="0 0 24 24" fill="white">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
      <circle cx="8" cy="10" r="1.5" />
      <circle cx="12" cy="10" r="1.5" />
      <circle cx="16" cy="10" r="1.5" />
    </svg>
  </div>
);

export const GoogleChatIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`${className} rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden shadow-xs`}>
    <svg className="w-[75%] h-[75%]" viewBox="0 0 24 24" fill="none">
      <path d="M2 7C2 4.23858 4.23858 2 7 2H12C14.7614 2 17 4.23858 17 7V12C17 14.7614 14.7614 17 12 17H7L2 21V7Z" fill="#00AC47" />
      <path d="M12 7H17C19.7614 7 22 9.23858 22 12V17C22 19.7614 19.7614 22 17 22H12L7 22V17H12C14.7614 17 17 14.7614 17 12V7Z" fill="#00832D" />
    </svg>
  </div>
);

export const GoogleVoiceIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`${className} rounded-xl bg-[#0F9D58] flex items-center justify-center text-white shrink-0 overflow-hidden shadow-xs`}>
    <svg className="w-[65%] h-[65%]" viewBox="0 0 24 24" fill="white">
      <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 00-1.02.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 12h2a9 9 0 00-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z" />
    </svg>
  </div>
);

export const DiscordIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`${className} rounded-xl bg-[#5865F2] flex items-center justify-center text-white shrink-0 overflow-hidden shadow-xs`}>
    <svg className="w-[70%] h-[70%]" viewBox="0 0 24 24" fill="white">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  </div>
);

export const SlackIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`${className} rounded-xl bg-[#4A154B] flex items-center justify-center shrink-0 overflow-hidden shadow-xs`}>
    <svg className="w-[68%] h-[68%]" viewBox="0 0 24 24" fill="none">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A" />
      <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0" />
      <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D" />
      <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E" />
    </svg>
  </div>
);

export const LinkedInIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`${className} rounded-xl bg-[#0A66C2] flex items-center justify-center text-white shrink-0 overflow-hidden shadow-xs`}>
    <svg className="w-[62%] h-[62%]" viewBox="0 0 24 24" fill="white">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z" />
    </svg>
  </div>
);

export const IrcIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`${className} rounded-xl bg-[#1E222A] border border-emerald-500/40 flex items-center justify-center text-[#00FF66] shrink-0 overflow-hidden shadow-xs font-mono font-black`}>
    <span className="text-xs sm:text-sm tracking-tighter">#irc</span>
  </div>
);

export const MatrixIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`${className} rounded-xl bg-[#0F141C] border border-[#0DBD8B]/40 flex items-center justify-center text-[#0DBD8B] shrink-0 overflow-hidden shadow-xs font-mono font-extrabold`}>
    <span className="text-xs tracking-tight">[m]</span>
  </div>
);


