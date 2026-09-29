const fs = require('fs');
let code = fs.readFileSync('components/workspace/AppSwitcherColumn.tsx', 'utf8');

// I will find the channels array and replace it entirely with a slightly modified one, OR just add a map.
// Let's add a map right after the channels array declaration:
const target = `  const channels: AppChannel[] = [`;
const replacement = `  const rawChannels: AppChannel[] = [`;

code = code.replace(target, replacement);

const endTarget = `    // Sort logic: Connected channels first`;
const endReplacement = `    const channels = rawChannels.map(ch => {
      const workingApps = ['whatsapp', 'whatsapp_2', 'telegram', 'discord'];
      const abandonedApps = ['linkedin', 'messenger', 'instagram', 'x_twitter'];
      
      let newCh = { ...ch };
      if (!workingApps.includes(ch.id)) {
        // We will inject grayscale directly by wrapping the icon Component
        newCh.iconComponent = <div className="grayscale opacity-40">{ch.iconComponent}</div>;
      }
      
      if (abandonedApps.includes(ch.id)) {
        newCh.isComingSoon = true;
        newCh.subtitle = "Under Construction";
      }
      
      return newCh;
    });

    // Sort logic: Connected channels first`;

code = code.replace(endTarget, endReplacement);

fs.writeFileSync('components/workspace/AppSwitcherColumn.tsx', code);
console.log("Rewrote sidebar channels array");
