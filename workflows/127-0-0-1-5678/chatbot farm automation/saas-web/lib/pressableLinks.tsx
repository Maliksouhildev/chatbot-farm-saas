import React from 'react';

export interface PressableTextOptions {
  appId?: string;
  isOperator?: boolean;
  linkClassName?: string;
  searchQuery?: string;
}

/**
 * Returns the native platform link styling for authentic channel fidelity.
 */
export function getChannelLinkClass(appId?: string, customClass?: string): string {
  if (customClass) return customClass;

  switch (appId?.toLowerCase()) {
    case 'telegram':
      return 'text-[#2481CC] dark:text-[#64B5F6] hover:underline break-all font-medium cursor-pointer transition-colors inline underline-offset-2';
    case 'discord':
      return 'text-[#00A8FC] hover:underline break-all font-medium cursor-pointer transition-colors inline underline-offset-2';
    case 'slack':
      return 'text-[#1264A3] dark:text-[#1D9BD1] hover:underline break-all font-medium cursor-pointer transition-colors inline underline-offset-2';
    case 'signal':
      return 'text-[#3A76F0] dark:text-[#709CFE] hover:underline break-all font-medium cursor-pointer transition-colors inline underline-offset-2';
    case 'viber':
      return 'text-[#7360F2] dark:text-[#9B8CFE] hover:underline break-all font-medium cursor-pointer transition-colors inline underline-offset-2';
    case 'whatsapp':
    case 'whatsapp_2':
      return 'text-[#027EB5] dark:text-[#53BDEB] hover:underline break-all font-medium cursor-pointer transition-colors inline underline-offset-2';
    case 'snapchat':
      return 'text-[#0070F3] dark:text-[#38BDF8] hover:underline break-all font-medium cursor-pointer transition-colors inline underline-offset-2';
    case 'matrix':
      return 'text-[#0DBD8B] dark:text-[#23F0B3] hover:underline break-all font-medium cursor-pointer transition-colors inline underline-offset-2';
    case 'irc':
      return 'text-[#58A6FF] hover:underline break-all font-mono cursor-pointer transition-colors inline';
    case 'google_messages':
    case 'google_chat':
    case 'google_voice':
      return 'text-[#1A73E8] dark:text-[#8AB4F8] hover:underline break-all font-medium cursor-pointer transition-colors inline underline-offset-2';
    case 'instagram':
      return 'text-[#0095F6] dark:text-[#70C5FB] hover:underline break-all font-medium cursor-pointer transition-colors inline underline-offset-2';
    case 'messenger':
      return 'text-[#0084FF] dark:text-[#58A6FF] hover:underline break-all font-medium cursor-pointer transition-colors inline underline-offset-2';
    default:
      return 'text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 hover:opacity-90 break-all font-medium cursor-pointer transition-colors inline';
  }
}

// Regex to capture candidate URLs (explicit http/https, www. prefixes, and recognized web domains)
const URL_REGEX = /(https?:\/\/[^\s<>()]+|www\.[^\s<>()]+|(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|edu|gov|io|co|ai|app|me|gg|dev|xyz|info|biz|tv|ly|link|site|online|tech|store|shop|ca|uk|fr|de|ru|jp|cn|dz|ma|tn)(?:\/[^\s<>()]*)?)/gi;

// Trailing punctuation characters to strip from end of URL matches
const TRAILING_PUNCTUATION_REGEX = /[.,!?:;)'"\]}>]+$/;

/**
 * Clean URL and separate any trailing punctuation from sentence boundaries
 */
function extractUrlAndPunctuation(rawMatch: string): { url: string; trailing: string } {
  // Check if trailing closing parenthesis has a matching opening parenthesis inside the URL
  let candidate = rawMatch;
  let trailing = '';

  const punctMatch = candidate.match(TRAILING_PUNCTUATION_REGEX);
  if (punctMatch) {
    const matchedTrailing = punctMatch[0];
    // Special handling for balanced parentheses (e.g. Wikipedia URLs)
    const openParenCount = (candidate.match(/\(/g) || []).length;
    const closeParenCount = (candidate.match(/\)/g) || []).length;
    if (matchedTrailing.endsWith(')') && openParenCount === closeParenCount) {
      // Balanced parentheses: keep closing parenthesis
      const subTrailing = matchedTrailing.slice(0, -1);
      if (subTrailing) {
        candidate = candidate.slice(0, -subTrailing.length);
        trailing = subTrailing;
      }
    } else {
      candidate = candidate.slice(0, -matchedTrailing.length);
      trailing = matchedTrailing;
    }
  }

  return { url: candidate, trailing };
}

/**
 * Normalizes URL into absolute href attribute
 */
export function normalizeHref(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (/^ftp:\/\//i.test(url)) return url;
  if (/^mailto:/i.test(url)) return url;
  if (/^tel:/i.test(url)) return url;
  return `https://${url}`;
}

/**
 * Highlight search query within plain text
 */
function renderSearchHighlight(text: string, query?: string): React.ReactNode {
  if (!query || !query.trim() || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  if (parts.length === 1) return text;

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white rounded-xs px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/**
 * Universal pressable text renderer.
 * Converts URLs, web links, and platform mentions (@username) into interactive, pressable <a> elements.
 */
export function renderPressableText(
  text: string | null | undefined,
  options?: PressableTextOptions
): React.ReactNode {
  if (!text) return null;

  const appId = options?.appId || '';
  const linkClass = getChannelLinkClass(appId, options?.linkClassName);
  const isTelegram = appId === 'telegram';

  // 1. Split text by URL regex
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = new RegExp(URL_REGEX);
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    const rawMatch = match[0];

    // Push preceding text before URL
    if (matchIndex > lastIndex) {
      const precedingText = text.slice(lastIndex, matchIndex);
      parts.push(processMentionsAndText(precedingText, isTelegram, linkClass, options?.searchQuery, parts.length));
    }

    // Process matched URL
    const { url, trailing } = extractUrlAndPunctuation(rawMatch);
    if (url) {
      const href = normalizeHref(url);
      parts.push(
        <a
          key={`url-${parts.length}-${matchIndex}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className={linkClass}
          title={href}
        >
          {url}
        </a>
      );
    }

    // Push trailing punctuation if any
    if (trailing) {
      parts.push(
        <React.Fragment key={`trail-${parts.length}`}>
          {renderSearchHighlight(trailing, options?.searchQuery)}
        </React.Fragment>
      );
    }

    lastIndex = matchIndex + rawMatch.length;
  }

  // Push remainder text after last match
  if (lastIndex < text.length) {
    const remainderText = text.slice(lastIndex);
    parts.push(processMentionsAndText(remainderText, isTelegram, linkClass, options?.searchQuery, parts.length));
  }

  if (parts.length === 0) return text;
  return parts;
}

/**
 * Process platform-specific mentions (@user) or standard plain text
 */
function processMentionsAndText(
  plainText: string,
  isTelegram: boolean,
  linkClass: string,
  searchQuery?: string,
  baseKey = 0
): React.ReactNode {
  if (!plainText) return null;

  // For Telegram and social apps, make @username pressable
  if (isTelegram || plainText.includes('@')) {
    const mentionRegex = /(@[a-zA-Z0-9_]{3,32})/g;
    const segments = plainText.split(mentionRegex);

    if (segments.length > 1) {
      return segments.map((seg, i) => {
        if (seg.startsWith('@')) {
          const username = seg.slice(1);
          const mentionHref = `https://t.me/${username}`;
          return (
            <a
              key={`mention-${baseKey}-${i}`}
              href={mentionHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className={`${linkClass} font-semibold`}
              title={`Telegram @${username}`}
            >
              {seg}
            </a>
          );
        }
        return (
          <React.Fragment key={`text-${baseKey}-${i}`}>
            {renderSearchHighlight(seg, searchQuery)}
          </React.Fragment>
        );
      });
    }
  }

  return (
    <React.Fragment key={`plain-${baseKey}`}>
      {renderSearchHighlight(plainText, searchQuery)}
    </React.Fragment>
  );
}
