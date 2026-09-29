const fs = require('fs');
let c = fs.readFileSync('components/workspace/RightHubColumn.tsx', 'utf8');

c = c.replace(
  "className=\"absolute top-[2px] bottom-[2px] bg-white rounded-lg shadow-sm z-0 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]\"",
  "className=\"absolute top-[2px] bottom-[2px] bg-white rounded-lg shadow-sm z-0\""
);

c = c.replace(
  "width: 'calc((100% - 12px) / 3)',\n              transform: `translateX(${\n                activeTab === 'contacts' ? '2px' : \n                activeTab === 'analytics' ? 'calc(100% + 6px)' : \n                'calc(200% + 10px)'\n              })`",
  "width: 'calc((100% - 12px) / 3)',\n              transform: `translateX(${\n                activeTab === 'contacts' ? '2px' : \n                activeTab === 'analytics' ? 'calc(100% + 6px)' : \n                'calc(200% + 10px)'\n              })`,\n              transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'"
);

fs.writeFileSync('components/workspace/RightHubColumn.tsx', c);
console.log("Indicator updated successfully");
