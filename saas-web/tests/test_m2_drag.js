const { launchBrowser, createPage, captureScreenshot } = require('./helpers');
const { tests: t1Tests } = require('./tier1_coverage.test');
const { tests: t2Tests } = require('./tier2_boundary.test');
const { tests: t3Tests } = require('./tier3_cross_feature.test');
const { scenarios: t4Scenarios } = require('./tier4_scenarios.test');

const TARGET_FEATURES = ['F3', 'F4', 'F5'];

function isRelevant(test) {
  if (TARGET_FEATURES.includes(test.feature)) return true;
  if (Array.isArray(test.features) && test.features.some(f => TARGET_FEATURES.includes(f))) return true;
  return false;
}

async function runTestItem(browser, test, tierName) {
  const { page, context } = await createPage(browser);
  const start = Date.now();
  let passed = false;
  let error = null;

  try {
    await test.fn({ page });
    passed = true;
    console.log(`  ✓ [PASS] [${test.id}] (${test.feature || test.features.join(',')}) ${test.name}`);
  } catch (err) {
    error = err.message;
    console.error(`  ✗ [FAIL] [${test.id}] (${test.feature || test.features.join(',')}) ${test.name}`);
    console.error(`     Error: ${err.message}`);
    const screenshot = await captureScreenshot(page, `${tierName}_${test.id}`);
    if (screenshot) console.error(`     Screenshot: ${screenshot}`);
  } finally {
    await context.close();
  }

  return { id: test.id, feature: test.feature || test.features, name: test.name, passed, error, durationMs: Date.now() - start };
}

async function main() {
  console.log('================================================================');
  console.log('   RUNNING M2 VERIFICATION SUITE: FEATURES F3, F4, F5');
  console.log('================================================================\n');

  const browser = await launchBrowser();
  const allResults = [];

  try {
    console.log('--- Tier 1: Coverage Tests ---');
    const t1Selected = t1Tests.filter(isRelevant);
    for (const test of t1Selected) {
      allResults.push(await runTestItem(browser, test, 'T1'));
    }

    console.log('\n--- Tier 2: Boundary Tests ---');
    const t2Selected = t2Tests.filter(isRelevant);
    for (const test of t2Selected) {
      allResults.push(await runTestItem(browser, test, 'T2'));
    }

    console.log('\n--- Tier 3: Cross-Feature Tests ---');
    const t3Selected = t3Tests.filter(isRelevant);
    for (const test of t3Selected) {
      allResults.push(await runTestItem(browser, test, 'T3'));
    }

    console.log('\n--- Tier 4: Scenarios ---');
    const t4Selected = t4Scenarios.filter(isRelevant);
    for (const test of t4Selected) {
      allResults.push(await runTestItem(browser, test, 'T4'));
    }
  } finally {
    await browser.close();
  }

  const passedCount = allResults.filter(r => r.passed).length;
  const failedCount = allResults.filter(r => !r.passed).length;
  console.log('\n================================================================');
  console.log(` SUMMARY: ${passedCount}/${allResults.length} passed, ${failedCount} failed`);
  console.log('================================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
