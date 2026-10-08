const fs = require('fs');
let c = fs.readFileSync('components/workspace/AppSwitcherColumn.tsx', 'utf8');

// 1. Add Backdrop and fix drawer height + animation
const targetDrawer = `{/* Sliding App Catalog Drawer */}
      <AnimatePresence>
        {isAddDrawerOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 top-14 bg-white dark:bg-[#1A1D23] z-50 rounded-b-3xl border-t border-[#DFDFD4] dark:border-[#2E333D] overflow-y-auto shadow-2xl p-4 custom-scrollbar"
          >`;

const replacementDrawer = `{/* Sliding App Catalog Drawer */}
      <AnimatePresence>
        {isAddDrawerOpen && (
          <React.Fragment>
            {/* Backdrop for Instagram-like comment feel */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 dark:bg-black/50 z-40 rounded-3xl"
              onClick={() => setIsAddDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="absolute inset-x-0 bottom-0 top-[40%] bg-white dark:bg-[#1A1D23] z-50 rounded-b-3xl border-t border-[#DFDFD4] dark:border-[#2E333D] overflow-y-auto shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] p-4 custom-scrollbar flex flex-col"
            >
              {/* Draggable Handle Indicator */}
              <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />`;

c = c.replace(targetDrawer, replacementDrawer);

// 2. Fix Grid columns and Icon size
const targetGrid = `<div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {rawChannels.filter(ch => !pinnedApps.includes(ch.id)).map(ch => (
                <div 
                  key={ch.id}
                  onClick={() => {
                    onPinApp && onPinApp(ch.id);
                  }}
                  className="relative flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-neutral-800 border border-transparent hover:border-gray-200 dark:hover:border-neutral-700"
                >
                  <div className="relative w-12 h-12 flex items-center justify-center">`;

const replacementGrid = `<div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))' }}>
              {rawChannels.filter(ch => !pinnedApps.includes(ch.id)).map(ch => (
                <div 
                  key={ch.id}
                  onClick={() => {
                    onPinApp && onPinApp(ch.id);
                  }}
                  className="relative flex flex-col items-center justify-center p-2 rounded-2xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-neutral-800 border border-transparent hover:border-gray-200 dark:hover:border-neutral-700 group"
                >
                  <div className="relative w-14 h-14 flex items-center justify-center scale-110 group-hover:scale-125 transition-transform duration-300">`;

c = c.replace(targetGrid, replacementGrid);

// Close the Fragment
const targetClose = `</motion.div>
        )}
      </AnimatePresence>`;

const replacementClose = `</motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>`;

c = c.replace(targetClose, replacementClose);

fs.writeFileSync('components/workspace/AppSwitcherColumn.tsx', c);
console.log("Successfully updated App Catalog");
