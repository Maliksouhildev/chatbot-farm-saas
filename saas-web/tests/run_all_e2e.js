#!/usr/bin/env node
/**
 * Master E2E Test Suite Runner
 * Runs Tiers 1-4 for features F1 - F9, writes JSON report, outputs summary table,
 * and sets exit code 0 on full pass, non-zero on failure.
 *
 * Usage:
 *   node tests/run_all_e2e.js
 *   node tests/run_all_e2e.js --tier=1
 *   node tests/run_all_e2e.js --tier=2
 *   node tests/run_all_e2e.js --tier=3
 *   node tests/run_all_e2e.js --tier=4
 *   node tests/run_all_e2e.js --feature=F1
 */

const fs = require('fs');
const path = require('path');
const { launchBrowser, REPORT_DIR } = require('./helpers');
const { runTier1, tests: t1Tests } = require('./tier1_coverage.test');
const { runTier2, tests: t2Tests } = require('./tier2_boundary.test');
const { runTier3, tests: t3Tests } = require('./tier3_cross_feature.test');
const { runTier4, scenarios: t4Scenarios } = require('./tier4_scenarios.test');

const args = process.argv.slice(2);
const tierArg = args.find(a => a.startsWith('--tier='));
const featureArg = args.find(a => a.startsWith('--feature='));
const selectedTier = tierArg ? parseInt(tierArg.split('=')[1], 10) : null;
const selectedFeature = featureArg ? featureArg.split('=')[1].toUpperCase() : null;

async function main() {
  const startTime = Date.now();
  console.log(`\n================================================================`);
  console.log(`  CHATBOT FARM SAAS — AUTOMATED PLAYWRIGHT E2E TEST RUNNER`);
  console.log(`  Timestamp: ${new Date().toISOString()}`);
  if (selectedTier) console.log(`  Filter Tier: ${selectedTier}`);
  if (selectedFeature) console.log(`  Filter Feature: ${selectedFeature}`);
  console.log(`================================================================`);

  const browser = await launchBrowser();
  const allResults = [];

  try {
    // Tier 1
    if (!selectedTier || selectedTier === 1) {
      const t1Results = await runTier1(browser);
      allResults.push(...t1Results);
    }

    // Tier 2
    if (!selectedTier || selectedTier === 2) {
      const t2Results = await runTier2(browser);
      allResults.push(...t2Results);
    }

    // Tier 3
    if (!selectedTier || selectedTier === 3) {
      const t3Results = await runTier3(browser);
      allResults.push(...t3Results);
    }

    // Tier 4
    if (!selectedTier || selectedTier === 4) {
      const t4Results = await runTier4(browser);
      allResults.push(...t4Results);
    }
  } finally {
    await browser.close();
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const total = allResults.length;
  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;

  // Breakdown by Tier
  const tierSummary = {};
  for (let t = 1; t <= 4; t++) {
    const tierItems = allResults.filter(r => r.tier === t);
    tierSummary[`Tier ${t}`] = {
      total: tierItems.length,
      passed: tierItems.filter(r => r.passed).length,
      failed: tierItems.filter(r => !r.passed).length,
    };
  }

  // Breakdown by Feature (F1 - F9)
  const featureSummary = {};
  for (let f = 1; f <= 9; f++) {
    const fid = `F${f}`;
    const fItems = allResults.filter(r => {
      if (r.feature === fid) return true;
      if (Array.isArray(r.features) && r.features.includes(fid)) return true;
      return false;
    });
    featureSummary[fid] = {
      total: fItems.length,
      passed: fItems.filter(r => r.passed).length,
      failed: fItems.filter(r => !r.passed).length,
    };
  }

  const summary = {
    timestamp: new Date().toISOString(),
    durationSeconds: parseFloat(durationSec),
    totalTests: total,
    passedCount: passed,
    failedCount: failed,
    passRatePercent: total > 0 ? parseFloat(((passed / total) * 100).toFixed(1)) : 0,
    byTier: tierSummary,
    byFeature: featureSummary,
    results: allResults,
  };

  // Write JSON report
  const reportPath = path.join(REPORT_DIR, 'e2e_results.json');
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf-8');

  // Print Summary Table
  console.log(`\n================================================================`);
  console.log(`                    TEST EXECUTION SUMMARY                      `);
  console.log(`================================================================`);
  console.log(`Total Duration: ${durationSec}s`);
  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:          ${passed}`);
  console.log(`Failed:          ${failed}`);
  console.log(`Pass Rate:       ${summary.passRatePercent}%\n`);

  console.log(`--- Breakdown By Tier ---`);
  console.table(tierSummary);

  console.log(`\n--- Breakdown By Feature (F1-F9) ---`);
  console.table(featureSummary);

  if (failed > 0) {
    console.log(`\n--- Failed Tests Detail ---`);
    allResults.filter(r => !r.passed).forEach(r => {
      console.log(`  ✗ [${r.id}] Tier ${r.tier} (${r.feature || (r.features || []).join('+')}) ${r.name}`);
      console.log(`    Reason: ${r.error}`);
    });
  }

  console.log(`\nFull JSON report saved to: ${reportPath}`);
  console.log(`================================================================\n`);

  process.exit(failed === 0 ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
