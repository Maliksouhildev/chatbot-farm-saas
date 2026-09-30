const fs = require('fs');
let code = fs.readFileSync('components/workspace/MiddleChatColumn.tsx', 'utf8');

// 1. Fix Auto-Scroll
const autoScrollOld = `  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, isSimulatingLoad]);`;

const autoScrollNew = `  useEffect(() => {
    if (!messagesEndRef.current) return;
    const container = messagesEndRef.current.parentElement;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 350;
      if (isNearBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSimulatingLoad]);`;

code = code.replace(autoScrollOld, autoScrollNew);

// 2. Fix Media Previews in renderMessageText
const renderTextOld = `  const renderMessageText = (text: string, query: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\\/\\/[^\\s]+)/g;
    const urlParts = text.split(urlRegex);

    return urlParts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }`;

const renderTextNew = `  const renderMessageText = (text: string, query: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\\/\\/[^\\s]+)/g;
    const urlParts = text.split(urlRegex);

    return urlParts.map((part, index) => {
      if (part.match(urlRegex)) {
        const url = part;
        const isImage = url.match(/\\.(jpeg|jpg|gif|png|webp)($|\\?)/i);
        const isVideo = url.match(/\\.(mp4|webm|ogg)($|\\?)/i);
        const isAudio = url.match(/\\.(mp3|wav|ogg)($|\\?)/i);
        const isTikTok = url.includes('tiktok.com');
        
        if (isImage) {
          return <img key={index} src={url} alt="Attachment" className="max-w-full rounded-lg max-h-64 object-contain mt-1 mb-1" onClick={(e) => e.stopPropagation()} />;
        }
        if (isVideo || isTikTok) {
          return (
            <video key={index} src={url} controls className="max-w-full rounded-lg max-h-64 mt-1 mb-1" onClick={(e) => e.stopPropagation()}>
              Your browser does not support the video tag.
            </video>
          );
        }
        if (isAudio) {
          return <audio key={index} src={url} controls className="max-w-full mt-1 mb-1" onClick={(e) => e.stopPropagation()} />;
        }

        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {url}
          </a>
        );
      }`;

code = code.replace(renderTextOld, renderTextNew);

// 3. Fix Reaction Picker Overlap
const reactionOld = `<div
      className="absolute -bottom-3.5 right-1 bg-white dark:bg-[#1E222A] shadow-xl border border-gray-200 dark:border-neutral-700 rounded-full px-2.5 py-1 flex items-center gap-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap"
    >`;

const reactionNew = `<div
      className="absolute -top-8 right-2 bg-white dark:bg-[#1E222A] shadow-xl border border-gray-200 dark:border-neutral-700 rounded-full px-2.5 py-1.5 flex items-center gap-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap"
    >`;

code = code.replace(reactionOld, reactionNew);

fs.writeFileSync('components/workspace/MiddleChatColumn.tsx', code);
console.log('Fixed MiddleChatColumn');
