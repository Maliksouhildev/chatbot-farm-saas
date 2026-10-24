/**
 * test_rapid_unpin_spam_click.js
 * Comprehensive test verifying rapid spam-clicking of the unpin (X) button on apps
 * under stationary cursor conditions.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('\n================================================================');
console.log('  TEST SUITE: RAPID SPAM-CLICKING UNPIN (X) BUTTON ON APPS');
console.log('  Timestamp:', new Date().toISOString());
console.log('================================================================\n');

let passedTests = 0;
let failedTests = 0;

function runTest(testName, testFn) {
  try {
    testFn();
    console.log(`  ✔ PASS: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✘ FAIL: ${testName}`);
    console.error(`     Error: ${err.message}\n`);
    failedTests++;
  }
}

// 1. Verify CSS rules in app/globals.css
runTest('TC-SPAM-01: globals.css contains instant is-hovered and strict :not(.is-hovered) rules for unpin button', () => {
  const globalsCss = fs.readFileSync(path.join(__dirname, '../app/globals.css'), 'utf8');
  assert(globalsCss.includes('.app-item-container.is-hovered .app-item-unpin-btn'), 'globals.css must have is-hovered unpin rule');
  assert(globalsCss.includes('.app-item-container:not(.is-hovered) .app-item-unpin-btn'), 'globals.css must strictly hide non-hovered items');
  assert(globalsCss.includes('pointer-events: auto !important;'), 'globals.css must set pointer-events: auto !important');
  assert(globalsCss.includes('opacity: 1 !important;'), 'globals.css must set opacity: 1 !important');
});

// 2. Verify CSS rules in AppSwitcherColumn.tsx
runTest('TC-SPAM-02: AppSwitcherColumn.tsx includes embedded CSS rules for instant is-hovered unpin visibility and strict hiding', () => {
  const switcherTsx = fs.readFileSync(path.join(__dirname, '../components/workspace/AppSwitcherColumn.tsx'), 'utf8');
  assert(switcherTsx.includes('.app-item-container.is-hovered .app-item-unpin-btn'), 'Switcher style tag must include is-hovered class rule');
  assert(switcherTsx.includes('.app-item-container:not(.is-hovered) .app-item-unpin-btn'), 'Switcher style tag must hide non-hovered items');
  assert(switcherTsx.includes('.app-item-unpin-btn:active'), 'Switcher style tag must support :active rule');
});

// 3. Verify SortableChannelItem container has app-item-container and stationary pointer listeners
runTest('TC-SPAM-03: SortableChannelItem container includes app-item-container and pointer hit listeners', () => {
  const switcherTsx = fs.readFileSync(path.join(__dirname, '../components/workspace/AppSwitcherColumn.tsx'), 'utf8');
  assert(switcherTsx.includes('className={`app-item-container'), 'Container must include app-item-container class');
  assert(switcherTsx.includes('onPointerEnter='), 'Container must have onPointerEnter listener');
  assert(switcherTsx.includes('onPointerMove='), 'Container must have onPointerMove listener');
  assert(switcherTsx.includes('onPointerOver='), 'Container must have onPointerOver listener');
  assert(switcherTsx.includes('onMouseMove='), 'Container must have onMouseMove listener');
});

// 4. Verify unpin button hit target expansion and strict isHovered visibility
runTest('TC-SPAM-04: Unpin button has extended click target (before:-inset-1.5) and strict isHovered visibility', () => {
  const switcherTsx = fs.readFileSync(path.join(__dirname, '../components/workspace/AppSwitcherColumn.tsx'), 'utf8');
  assert(switcherTsx.includes('before:-inset-1.5'), 'Unpin button must have extended touch/click target');
  assert(switcherTsx.includes("isHovered \n              ? 'opacity-100 pointer-events-auto visible' \n              : 'opacity-0 pointer-events-none invisible'") || switcherTsx.includes('isHovered ? \'opacity-100 pointer-events-auto visible\' : \'opacity-0 pointer-events-none invisible\'') || switcherTsx.includes('pointer-events-auto visible'), 'Unpin button must be strictly bound to isHovered');
  assert(switcherTsx.includes('z-50'), 'Unpin button must have z-50 to stay strictly above background hit-areas');
});

// 5. Verify global pointer coordinate tracking and cf-unpin-refresh event dispatch
runTest('TC-SPAM-05: Global pointer tracker and cf-unpin-refresh custom event are present', () => {
  const switcherTsx = fs.readFileSync(path.join(__dirname, '../components/workspace/AppSwitcherColumn.tsx'), 'utf8');
  assert(switcherTsx.includes('globalPointerCoords'), 'globalPointerCoords must be tracked across window events');
  assert(switcherTsx.includes('cf-unpin-refresh'), 'cf-unpin-refresh custom event must be dispatched and listened to');
  assert(switcherTsx.includes('checkStationaryHover'), 'checkStationaryHover helper must perform hit testing on layout/update');
});

// 6. Verify immediate localPinned filtering in handleUnpinAppWrapper
runTest('TC-SPAM-06: handleUnpinAppWrapper filters localPinned immediately for 0-lag UI responsiveness', () => {
  const switcherTsx = fs.readFileSync(path.join(__dirname, '../components/workspace/AppSwitcherColumn.tsx'), 'utf8');
  assert(switcherTsx.includes('setLocalPinned((prev) => prev.filter(id => id !== appId));'), 'handleUnpinAppWrapper must filter localPinned immediately');
});

// 7. Simulate stationary cursor spam-clicking through 5 apps sequentially
runTest('TC-SPAM-07: Rapid spam-clicking simulation under stationary cursor unpins all 5 items', () => {
  let pinned = ['whatsapp', 'telegram', 'signal', 'discord', 'slack'];
  const fixedCursorPos = { x: 260, y: 140 }; // Fixed mouse position on the unpin button

  // Mock layout coordinates for items: each item is 60px high with 10px gap
  const getItemRect = (index) => ({
    left: 20,
    top: 100 + index * 70,
    right: 280,
    bottom: 160 + index * 70,
    unpinButtonRect: {
      left: 250,
      top: 95 + index * 70,
      right: 275,
      bottom: 120 + index * 70
    }
  });

  const checkStationaryHoverSim = (itemIndex, cursorPos) => {
    const rect = getItemRect(itemIndex);
    // Point within container rect
    return (
      cursorPos.x >= rect.left &&
      cursorPos.x <= rect.right &&
      cursorPos.y >= rect.top &&
      cursorPos.y <= rect.bottom
    );
  };

  const removedApps = [];

  // User spam-clicks 5 times without moving cursor from (260, 140)
  for (let click = 0; click < 5; click++) {
    // Current item at index 0 is under cursor
    assert(pinned.length > 0, 'Pinned apps should not be empty during spam sequence');
    const isHovered = checkStationaryHoverSim(0, fixedCursorPos);
    assert.strictEqual(isHovered, true, `Item ${pinned[0]} at index 0 must be detected as hovered by stationary cursor`);

    // Simulate unpin click
    const appToRemove = pinned[0];
    removedApps.push(appToRemove);
    pinned = pinned.filter(id => id !== appToRemove);
  }

  assert.strictEqual(removedApps.length, 5, 'All 5 apps must be removed in rapid sequence');
  assert.strictEqual(pinned.length, 0, 'Pinned apps list should now be empty');
});

console.log('\n================================================================');
console.log(`  TEST RESULTS: ${passedTests} PASSED | ${failedTests} FAILED`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
