# E2E Test Infra: SaaS Web Application

## Test Philosophy
- Opaque-box, requirement-driven derivation from ORIGINAL_REQUEST.md.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial + Real-World Workload Testing.
- Test runner: Automated Playwright scripts in `tests/` executed via Node.js.

## Feature Inventory & Test Coverage Mapping
| # | Feature | Requirement | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) |
|---|---------|-------------|:-----------------:|:-----------------:|:---------------------:|
| F1 | Responsive Navbar | ORIGINAL_REQUEST §R1 | ≥5 cases | ≥5 cases | ✓ |
| F2 | App Switcher Container Queries | ORIGINAL_REQUEST §R1 | ≥5 cases | ≥5 cases | ✓ |
| F3 | Drag Placeholder Under Cursor | ORIGINAL_REQUEST §R2 | ≥5 cases | ≥5 cases | ✓ |
| F4 | Draggable MiddleChatColumn | ORIGINAL_REQUEST §R2 | ≥5 cases | ≥5 cases | ✓ |
| F5 | Hide Panel Resize Handles During Drag | ORIGINAL_REQUEST §R2 | ≥5 cases | ≥5 cases | ✓ |
| F6 | Detached Panels 3s Disappearance Fix | ORIGINAL_REQUEST §R3 | ≥5 cases | ≥5 cases | ✓ |
| F7 | High-Visibility Panel Detach Button | ORIGINAL_REQUEST §R3 | ≥5 cases | ≥5 cases | ✓ |
| F8 | Persistent Telegram Topics Split Pane | ORIGINAL_REQUEST §R4 | ≥5 cases | ≥5 cases | ✓ |
| F9 | Global Real Profile Pictures | ORIGINAL_REQUEST §R4 | ≥5 cases | ≥5 cases | ✓ |

## Test Architecture
- Test Runner: Node.js with Playwright (`playwright` package)
- Master Runner: `node tests/run_all_e2e.js`
- Test Output: JSON reports with screenshot artifacts in `tests/reports/` and `tests/screenshots/`
- Pass/Fail Semantics: Process exits with code 0 on all tests passing, non-zero on failure.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Narrow Mobile Navigation & Channel Switching | F1, F2 | Medium |
| 2 | Full Workspace Column Reordering & Drag Polish | F3, F4, F5 | High |
| 3 | Detached Analytics & Settings Long-Lived Monitoring (10+ seconds) | F6, F7 | High |
| 4 | Telegram Omnichannel Topic Browsing & Chat | F8, F9 | High |
| 5 | End-to-End Multitasking: Detached Panels + Drag Reorder + Mobile Collapse | F1, F2, F3, F4, F5, F6, F7, F8, F9 | Complex |

## Coverage Thresholds
- Tier 1 (Feature Coverage): ≥5 tests per feature (≥45 tests)
- Tier 2 (Boundary & Corner Cases): ≥5 tests per feature (≥45 tests)
- Tier 3 (Cross-Feature Combinations): Pairwise coverage of major feature interactions (≥10 tests)
- Tier 4 (Real-World Application Scenarios): 5 realistic end-to-end user workflows
- Minimum Total Test Cases: ≥105 test cases / assertions
