# Project: SaaS Web UI Polish & Defect Remediation

## Architecture
Next.js 14 App Router application with React 18, Tailwind CSS, Lucide icons, `@dnd-kit` for drag-and-drop column layouts, `react-resizable-panels` for panel resizing, Supabase authentication & user preferences persistence, and omnichannel chat replica views.

The workspace layout is structured as:
- Top Header: `components/layout/Navbar.tsx`
- Resizable Drag-and-Drop Columns:
  - Column 1: `components/workspace/AppSwitcherColumn.tsx` (channel selection & Auto-AI toggle)
  - Column 2: `components/workspace/MiddleChatColumn.tsx` & `ChannelNativeViews.tsx` (multichannel chat views)
  - Column 3: `components/workspace/RightHubColumn.tsx` (contacts, search, details, detached tabs)
  - Dynamic Detached Columns: `analytics` and `settings` when detached into standalone panels.
- State Management: `app/page.tsx` & `ChatStoreContext.tsx`
- Mock Data Layer: `lib/mock_chats.ts`

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Multi-step Navbar Container Queries | Implement `@container navbar` on `<header>`: Logo anchors far left (`mr-auto`), Actions anchor far right (`ml-auto`), nav tabs hide at <=880px, AI Agent toggle collapses text at <=640px, and AI toggle becomes transparent/disappears at <=400px with zero horizontal scroll. | M1 | ORIGINAL_REQUEST §R1 |
| F2 | App Switcher Container Queries & Button Collapse | Implement `@container appswitcher`: "Auto-AI" text collapses earlier into circular logo button at <=250px. "Add Channel / Phone" button at bottom shrinks to centered 36px `+` icon button without text overflow at <=200px. | M1 | ORIGINAL_REQUEST §R1 |
| F3 | Drag Placeholder Under Cursor | Fix `DndContext` / `SortableContext` bug: add `onDragOver` handler to update `columnOrder` during drag, switch collision detection to `pointerWithin`/`closestCenter`, and add `DragOverlay` to avoid empty slot on far left. | M2 | ORIGINAL_REQUEST §R2 |
| F4 | Draggable MiddleChatColumn | Spread `{...dragHandleProps}` across all 17 channel headers in `MiddleChatColumn.tsx` and `ChannelNativeViews.tsx`. Add `draggable={false}` to avatar images to prevent native HTML5 image drag interruption. | M2 | ORIGINAL_REQUEST §R2 |
| F5 | Hide Panel Resize Handles During Drag | Wire `is-dragging` CSS class on workspace container during active column drag, setting `opacity: 0 !important; pointer-events: none !important;` on `.custom-resize-handle` and `::after`. | M2 | ORIGINAL_REQUEST §R2 |
| F6 | Detached Panels 3-Second Disappearance Fix | Eliminate Supabase auth echo loop: ignore `USER_UPDATED` event in `onAuthStateChange`, preserve detached tabs in `applyUserPreferences`, and normalize layout calculation across all active columns. | M3 | ORIGINAL_REQUEST §R3 |
| F7 | High-Visibility Panel Detach Button | Replace the muted transparent detach icon in `RightHubColumn.tsx` with a distinct, prominent button (e.g. rose/red styled button with icon and text) visible in both light and dark modes. | M3 | ORIGINAL_REQUEST §R3 |
| F8 | Persistent Telegram Topics Split Pane | Fix `fetchActiveChats` in `app/page.tsx` to prevent wiping fallback contacts, correct `setSelectedContactPath` array comparison bug, bypass Directory Mode in `MiddleChatColumn.tsx` for forum topics, and populate `topicId` in `tg_1.messages`. | M4 | ORIGINAL_REQUEST §R4 |
| F9 | Global Real Profile Pictures | Update `ChannelNativeViews.tsx` to render `<img>` profile pictures across all 8 channel headers. Add realistic avatar image URLs in `mock_chats.ts` for all contacts and channels (including google_voice, irc, matrix). | M4 | ORIGINAL_REQUEST §R4 |
| F10 | Comprehensive Automated E2E Test Suite | Design and implement an automated Playwright test suite covering Tiers 1-4 for all features F1-F9, producing `TEST_READY.md`. | E2E-Track | Dual Track |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Responsive Navbar & App Switcher Layouts | Features F1, F2: Container queries in `Navbar.tsx`, `AppSwitcherColumn.tsx`, and `globals.css`. | None | IN_PROGRESS |
| M2 | Drag-and-Drop & Resizing Polish | Features F3, F4, F5: `DndContext` `onDragOver` & `DragOverlay` in `page.tsx`, `dragHandleProps` across all headers in `MiddleChatColumn.tsx` & `ChannelNativeViews.tsx`, `is-dragging` resize handle CSS. | None | IN_PROGRESS |
| M3 | Detached Panels & UI Visibility | Features F6, F7: Fix 3s disappearance echo loop in `page.tsx`, redesign detach button in `RightHubColumn.tsx`. | M2 | PLANNED |
| M4 | Telegram UI & Global Avatars | Features F8, F9: Fix topics split-pane persistence in `page.tsx`, `MiddleChatColumn.tsx`, and `mock_chats.ts`; render real image avatars globally in `ChannelNativeViews.tsx` and `RightHubColumn.tsx`. | M3 | PLANNED |
| M5 | Final Milestone: 100% E2E Test Pass & Coverage Hardening | Pass 100% of Tiers 1-4 tests published in `TEST_READY.md`, followed by Tier 5 adversarial testing. | M1, M2, M3, M4, E2E-Track | PLANNED |
| E2E | E2E Testing Suite Track | Implement automated Playwright test suite (Tiers 1-4) covering F1-F9 and publish `TEST_READY.md`. | None | IN_PROGRESS |

## Interface Contracts
### `app/page.tsx` ↔ `components/workspace/MiddleChatColumn.tsx`
- `dragHandleProps`: Passed from `SortableColumn` as `{ ...attributes, ...listeners }`.
- Expected: All channel headers (17 channels) must spread `{...dragHandleProps}` onto their header container element and apply `cursor-grab active:cursor-grabbing` and `touch-action: none`.

### `components/workspace/RightHubColumn.tsx` ↔ `app/page.tsx`
- `onDetach`: `(tabId: string) => void`. Called when user clicks the prominent detach button on an active tab.
- `detachedTabs`: `string[]`. List of currently detached tab identifiers.
- When detached, `columnOrder` includes the tab, and Supabase auth sync MUST NOT reset `columnOrder` to 3 core columns.

### `app/page.tsx` ↔ `components/workspace/RightHubColumn.tsx` (Telegram Topics)
- `selectedContactPath`: `string[]`. Formatted as `[contactId]` or `[contactId, topicId]`.
- Polling in `fetchActiveChats` MUST preserve `selectedContactPath` array and not convert it to empty string `''`.

## Code Layout
- `components/layout/Navbar.tsx`: Navbar container query styles, logo alignment, AI toggle collapse.
- `components/workspace/AppSwitcherColumn.tsx`: App Switcher container queries, Auto-AI collapse, Add button shrink.
- `components/workspace/MiddleChatColumn.tsx`: Drag handles, directory mode bypass for topics, chat messages display.
- `components/workspace/ChannelNativeViews.tsx`: Native channel headers with dragHandleProps and avatar image rendering.
- `components/workspace/RightHubColumn.tsx`: Contacts list avatars, topics split-pane, prominent detach button.
- `app/page.tsx`: Workspace drag-and-drop context, layout persistence, auth listener echo filter, chat polling.
- `app/globals.css`: Global styles, `.is-dragging` rules, container query utilities.
- `lib/mock_chats.ts`: Mock contacts with valid `profilePicUrl`, Telegram topics with matching `topicId` messages.
- `tests/`: Automated Playwright E2E and responsiveness test scripts.
