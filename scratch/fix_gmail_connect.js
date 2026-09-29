const fs = require('fs');
const path = 'components/workspace/ConnectChannelModal.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /const handleVerifyGmail = async \([^)]*\) => \{[\s\S]*?setIsVerifyingGmail\(false\);\n\s*\}\n\s*\};/;

const replacement = `const handleVerifyGmail = async (customEmail?: string) => {
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
  };`;

const match = code.match(regex);
if (match) {
  code = code.replace(regex, replacement);
  fs.writeFileSync(path, code);
  console.log("Replaced handleVerifyGmail");
} else {
  console.log("Regex not found!");
}
