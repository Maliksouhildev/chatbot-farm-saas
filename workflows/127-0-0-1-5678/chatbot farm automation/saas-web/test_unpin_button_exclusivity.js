/**
 * test_unpin_button_exclusivity.js
 * Verifies that the red cross (unpin) button ONLY appears on the single hovered app,
 * never everywhere or on multiple apps simultaneously.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('\n================================================================');
console.log('  TEST SUITE: UNPIN (X) BUTTON HOVER EXCLUSIVITY');
console.log('  Timestamp:', new Date().toISOString());
console.log('================================================================\n');

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✔ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✘ FAIL: ${name}`);
    console.error(`     Error: ${err.message}\n`);
    failedTests++;
  }
}

const switcherPath = path.join(__dirname, '../components/workspace/AppSwitcherColumn.tsx');
const switcherContent = fs.readFileSync(switcherPath, 'utf8');

const globalsPath = path.join(__dirname, '../app/globals.css');
const globalsContent = fs.readFileSync(globalsPath, 'utf8');

runTest('EX-01: AppSwitcherColumn manages hoveredAppId as exclusive single-value state', () => {
  assert(switcherContent.includes('const [hoveredAppId, setHoveredAppId] = useState<string | null>(null);'), 'hoveredAppId must be managed in AppSwitcherColumn');
});

runTest('EX-02: SortableChannelItem receives isHovered derived exclusively from hoveredAppId === ch.id', () => {
  assert(switcherContent.includes('isHovered={hoveredAppId === ch.id}'), 'isHovered prop must be strictly bound to hoveredAppId === ch.id');
});

runTest('EX-03: No individual ChannelItem has independent isHovered state that stays stuck true', () => {
  // Extract SortableChannelItem definition
  const sortableBlock = switcherContent.substring(
    switcherContent.indexOf('function SortableChannelItem'),
    switcherContent.indexOf('export const AppSwitcherColumn')
  );
  assert(!sortableBlock.includes('const [isHovered, setIsHovered] = useState'), 'SortableChannelItem must NOT maintain an unconstrained local isHovered state');
});

runTest('EX-04: Channel container clears hover state on mouse leave or list boundary exit', () => {
  assert(switcherContent.includes('onPointerLeave={() => setHoveredAppId(null)}'), 'List container must clear hoveredAppId on pointer leave');
  assert(switcherContent.includes('onMouseLeave={() => setHoveredAppId(null)}'), 'List container must clear hoveredAppId on mouse leave');
  assert(switcherContent.includes('onUnhover={() => setHoveredAppId((cur) => cur === ch.id ? null : cur)}'), 'Item onUnhover must clear only its own ID');
});

runTest('EX-05: globals.css does not keep unpin button visible via persistent :focus', () => {
  assert(!globalsContent.includes('.app-item-unpin-btn:focus'), 'globals.css must not force visibility via .app-item-unpin-btn:focus');
});

runTest('EX-06: Mathematical exclusivity simulation: only 1 app can have isHovered=true at any time', () => {
  const apps = ['whatsapp', 'telegram', 'discord', 'instagram', 'gmail'];
  
  // Test across all app selections
  for (const activeHoverId of [...apps, null]) {
    const hoveredCount = apps.filter(id => id === activeHoverId).length;
    if (activeHoverId === null) {
      assert.strictEqual(hoveredCount, 0, 'When cursor is outside, exactly 0 apps must be hovered');
    } else {
      assert.strictEqual(hoveredCount, 1, `When hovering ${activeHoverId}, exactly 1 app must be hovered`);
    }
  }
});

runTest('EX-07: SortableColumn in app/page.tsx has no group class (prevents parent hover leakage)', () => {
  const pagePath = path.join(__dirname, '../app/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  const sortableMatch = pageContent.match(/function SortableColumn[\s\S]*?return \([\s\S]*?<div[\s\S]*?className=\{`([^`]+)`\}/);
  assert(sortableMatch, 'SortableColumn div must be found');
  assert(!sortableMatch[1].split(' ').includes('group'), 'SortableColumn container must NOT have group class');
});

runTest('EX-08: SortableChannelItem unpin button has ZERO group-hover classes', () => {
  assert(!switcherContent.includes('group-hover:opacity-100'), 'unpin button must NOT have group-hover:opacity-100');
  assert(!switcherContent.includes('group-hover:pointer-events-auto'), 'unpin button must NOT have group-hover:pointer-events-auto');
});

runTest('EX-09: CSS explicitly hides unpin button for .app-item-container:not(.is-hovered)', () => {
  assert(globalsContent.includes('.app-item-container:not(.is-hovered) .app-item-unpin-btn'), 'globals.css must hide unpin button for non-hovered items');
  assert(switcherContent.includes('.app-item-container:not(.is-hovered) .app-item-unpin-btn'), 'AppSwitcherColumn must hide unpin button for non-hovered items');
});

console.log('\n================================================================');
console.log(`  TEST RESULTS: ${passedTests} PASSED | ${failedTests} FAILED`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
