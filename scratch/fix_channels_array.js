const fs = require('fs');
let code = fs.readFileSync('components/workspace/AppSwitcherColumn.tsx', 'utf8');

const target = `    ];
  
  const liveCount = channels.filter(c => c.status === 'connected').length;`;

const replacement = `    ];
  
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

  const liveCount = channels.filter(c => c.status === 'connected').length;`;

code = code.replace(target, replacement);
fs.writeFileSync('components/workspace/AppSwitcherColumn.tsx', code);
console.log("Fixed AppSwitcherColumn channels definition");
