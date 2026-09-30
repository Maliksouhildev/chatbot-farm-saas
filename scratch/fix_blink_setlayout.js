const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

const updatedLogic = `      setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        const next = arrayMove(prev, oldIndex, newIndex);
        debouncedSyncPreferences({ columnOrder: next });
        
        // Restore correct sizes for the new layout array to prevent them from inheriting the wrong positional size
        setTimeout(() => {
          if (groupRef.current) {
            try {
              const stored = localStorage.getItem(getStorageKey('cf_panel_sizes'));
              if (stored) {
                const parsed = JSON.parse(stored);
                const visibleCols = next.filter(c => !(c === 'hub' && isRightHubCollapsed));
                const newSizes = visibleCols.map(colId => parsed[colId] !== undefined ? parsed[colId] : (colId === 'switcher' ? 25 : colId === 'chat' ? 45 : 30));
                
                // Normalise to 100% just in case
                const total = newSizes.reduce((a,b) => a+b, 0);
                const normalized = newSizes.map(s => (s/total)*100);
                
                groupRef.current.setLayout(normalized);
              }
            } catch {}
          }
        }, 10);
        
        return next;
      });`;

const regex = /setColumnOrder\(\(prev\) => \{[\s\S]*?return next;\s*\}\);/;

code = code.replace(regex, updatedLogic);

fs.writeFileSync('app/page.tsx', code);
console.log('Fixed page.tsx Group blink and setLayout');
