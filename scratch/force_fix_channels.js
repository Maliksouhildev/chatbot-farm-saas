const fs = require('fs');
let code = fs.readFileSync('components/workspace/AppSwitcherColumn.tsx', 'utf8');

const replacementText = `
  const channels = rawChannels.map(ch => {
    const workingApps = ['whatsapp', 'whatsapp_2', 'telegram', 'discord'];
    const abandonedApps = ['linkedin', 'messenger', 'instagram', 'x_twitter'];
    
    let newCh = { ...ch };
    if (!workingApps.includes(ch.id)) {
      newCh.iconComponent = <div className="grayscale opacity-40">{ch.iconComponent}</div>;
    }
    
    if (abandonedApps.includes(ch.id)) {
      newCh.isComingSoon = true;
      newCh.subtitle = "Under Construction";
    }
    
    return newCh;
  });

  const liveCount`;

// Make sure we only replace once or if not already replaced
if (!code.includes("const channels = rawChannels.map")) {
    code = code.replace(/const liveCount/, replacementText);
    fs.writeFileSync('components/workspace/AppSwitcherColumn.tsx', code);
    console.log("Forced fix channels");
} else {
    console.log("Already fixed");
}
