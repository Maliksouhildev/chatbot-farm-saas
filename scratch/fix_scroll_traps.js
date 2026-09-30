const fs = require('fs');

let code = fs.readFileSync('components/workspace/MiddleChatColumn.tsx', 'utf8');

// 1. Fix the [activeMessages] effect
const activeMessagesOld = `  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [activeMessages]);`;

const activeMessagesNew = `  useEffect(() => {
    if (!messagesEndRef.current) return;
    const container = messagesEndRef.current.parentElement;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 350;
      if (isNearBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      }
    } else {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [activeMessages]);`;

code = code.replace(activeMessagesOld, activeMessagesNew);

// 2. Fix the handleInputFocus issue
const inputFocusOld = `  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    setTimeout(() => {
      target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 250);
  };`;

const inputFocusNew = `  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    setTimeout(() => {
      target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      // Removed aggressive snap to bottom here
    }, 250);
  };`;

code = code.replace(inputFocusOld, inputFocusNew);

fs.writeFileSync('components/workspace/MiddleChatColumn.tsx', code);
console.log('Fixed MiddleChatColumn Scroll Traps');
