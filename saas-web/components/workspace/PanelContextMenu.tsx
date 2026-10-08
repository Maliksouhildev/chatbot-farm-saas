"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Maximize2,
  ArrowLeftRight,
  Columns3,
  Bookmark,
  Save,
  Copy,
  Check,
  ClipboardPaste,
  Trash2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  X,
  LayoutGrid,
} from 'lucide-react';

export interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  columnOrder: string[];
  panelSizes: Record<string, number>;
}

export interface SavedLayout {
  id: string;
  name: string;
  createdAt: number;
  columnOrder: string[];
  panelSizes: Record<string, number>;
}

export const PREDEFINED_LAYOUTS: LayoutPreset[] = [
  {
    id: 'default',
    name: 'Standard Workspace',
    description: 'Balanced 3-column workflow (25% | 45% | 30%)',
    columnOrder: ['switcher', 'chat', 'hub'],
    panelSizes: { switcher: 25, chat: 45, hub: 30 }
  },
  {
    id: 'chat_focus',
    name: 'Chat Focus',
    description: 'Expanded center conversation area (16% | 60% | 24%)',
    columnOrder: ['switcher', 'chat', 'hub'],
    panelSizes: { switcher: 16, chat: 60, hub: 24 }
  },
  {
    id: 'hub_focus',
    name: 'Hub & CRM Focus',
    description: 'Expanded profile & tools pane (18% | 38% | 44%)',
    columnOrder: ['switcher', 'chat', 'hub'],
    panelSizes: { switcher: 18, chat: 38, hub: 44 }
  },
  {
    id: 'equal_split',
    name: 'Equal Distribution',
    description: 'Even three-way split (33% | 33% | 33%)',
    columnOrder: ['switcher', 'chat', 'hub'],
    panelSizes: { switcher: 33.3, chat: 33.4, hub: 33.3 }
  },
  {
    id: 'compact_rail',
    name: 'Compact Dock Rail',
    description: 'Slim icon rail with wide chat & hub (8% | 62% | 30%)',
    columnOrder: ['switcher', 'chat', 'hub'],
    panelSizes: { switcher: 8, chat: 62, hub: 30 }
  },
  {
    id: 'reversed_workflow',
    name: 'Reversed Layout',
    description: 'Hub on left, dock on right (30% | 45% | 25%)',
    columnOrder: ['hub', 'chat', 'switcher'],
    panelSizes: { hub: 30, chat: 45, switcher: 25 }
  }
];

export interface PanelContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  targetColId?: string;
  isRightHubCollapsed: boolean;
  columnOrder: string[];
  currentSizes: Record<string, number>;
  onClose: () => void;
  onResetAll: () => void;
  onResetSizeOnly: () => void;
  onResetPositionOnly: () => void;
  onApplyPreset: (preset: LayoutPreset) => void;
  onSaveCurrentLayout: (name: string) => void;
  savedLayouts: SavedLayout[];
  onApplySavedLayout: (layout: SavedLayout) => void;
  onDeleteSavedLayout: (id: string) => void;
  onCopyLayout: () => void;
  onPasteLayout: (pastedText: string) => boolean;
  onMaximizeCol?: (colId: string) => void;
  onMoveCol?: (colId: string, direction: 'left' | 'right') => void;
}

export const PanelContextMenu: React.FC<PanelContextMenuProps> = ({
  isOpen,
  position,
  targetColId,
  isRightHubCollapsed,
  columnOrder,
  currentSizes,
  onClose,
  onResetAll,
  onResetSizeOnly,
  onResetPositionOnly,
  onApplyPreset,
  onSaveCurrentLayout,
  savedLayouts,
  onApplySavedLayout,
  onDeleteSavedLayout,
  onCopyLayout,
  onPasteLayout,
  onMaximizeCol,
  onMoveCol
}) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'actions' | 'presets' | 'saved'>('actions');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteInputText, setPasteInputText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show feedback message briefly
  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  // Viewport clamping
  const menuWidth = 320;
  const menuHeight = 440;
  const clampedX = Math.min(Math.max(12, position.x), Math.max(12, window.innerWidth - menuWidth - 12));
  const clampedY = Math.min(Math.max(12, position.y), Math.max(12, window.innerHeight - menuHeight - 12));

  const targetColName = targetColId === 'switcher' 
    ? 'Channels Panel' 
    : targetColId === 'chat' 
      ? 'Conversation Feed' 
      : targetColId === 'hub' 
        ? 'Workspace Hub' 
        : targetColId;

  const handleCopy = () => {
    onCopyLayout();
    setCopiedSuccess(true);
    triggerFeedback('Layout copied to clipboard!');
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleNativePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && onPasteLayout(text)) {
          triggerFeedback('Layout pasted and applied!');
          setTimeout(() => onClose(), 600);
          return;
        }
      }
    } catch {}
    // Fallback to manual paste input
    setShowPasteModal(true);
  };

  const handleManualPasteSubmit = () => {
    if (pasteInputText.trim()) {
      const ok = onPasteLayout(pasteInputText.trim());
      if (ok) {
        triggerFeedback('Layout applied successfully!');
        setShowPasteModal(false);
        setTimeout(() => onClose(), 600);
      } else {
        triggerFeedback('Invalid layout JSON format.');
      }
    }
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = saveName.trim() || `Layout ${savedLayouts.length + 1}`;
    onSaveCurrentLayout(name);
    setSaveName('');
    setShowSaveInput(false);
    triggerFeedback(`Saved "${name}"!`);
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] pointer-events-auto">
      {/* Toast Feedback */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[1000000] px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-400/40"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{feedbackMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.94, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 6 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: clampedY,
          left: clampedX,
          width: menuWidth,
        }}
        className="bg-white/95 dark:bg-[#1A1D23]/95 backdrop-blur-xl border border-gray-200/80 dark:border-neutral-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.55)] p-2.5 flex flex-col gap-2 select-none overflow-hidden text-gray-800 dark:text-gray-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-1.5 pt-0.5 pb-1 border-b border-gray-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5">
            <LayoutGrid className="w-4 h-4 text-emerald-500" />
            <span className="text-[12px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-200">
              Panel Layout Controls
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Target Panel Pill (if right clicked directly on a panel) */}
        {targetColId && (
          <div className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
            <span className="truncate">Selected: {targetColName}</span>
            <div className="flex items-center gap-1 shrink-0">
              {onMoveCol && (
                <>
                  <button
                    onClick={() => { onMoveCol(targetColId, 'left'); triggerFeedback(`Moved ${targetColId} left`); }}
                    className="p-1 rounded hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 transition-colors"
                    title="Move panel to left"
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => { onMoveCol(targetColId, 'right'); triggerFeedback(`Moved ${targetColId} right`); }}
                    className="p-1 rounded hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 transition-colors"
                    title="Move panel to right"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </>
              )}
              {onMaximizeCol && (
                <button
                  onClick={() => { onMaximizeCol(targetColId); triggerFeedback(`Maximized ${targetColName}`); onClose(); }}
                  className="p-1 rounded hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 transition-colors"
                  title="Maximize this panel"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab Switcher: Quick Actions / Presets / Saved */}
        <div className="grid grid-cols-3 gap-1 p-0.5 rounded-xl bg-gray-100 dark:bg-neutral-900 border border-gray-200/60 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab('actions')}
            className={`py-1 text-[10.5px] font-bold rounded-lg transition-all ${
              activeTab === 'actions'
                ? 'bg-white dark:bg-[#252932] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Reset
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-1 text-[10.5px] font-bold rounded-lg transition-all ${
              activeTab === 'presets'
                ? 'bg-white dark:bg-[#252932] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Presets
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`py-1 text-[10.5px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-[#252932] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <span>Saved</span>
            {savedLayouts.length > 0 && (
              <span className="px-1 py-0.2 bg-emerald-500 text-white rounded-full text-[9px] font-black">
                {savedLayouts.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto max-h-[290px] pr-0.5 custom-scrollbar flex flex-col gap-1.5">
          {activeTab === 'actions' && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-gray-400 px-1.5 uppercase tracking-wider">
                Reset Layout
              </span>

              {/* Reset Both */}
              <button
                onClick={() => {
                  onResetAll();
                  triggerFeedback('Reset both position & sizes to default!');
                  onClose();
                }}
                className="w-full text-left p-2 rounded-xl flex items-center gap-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-700 dark:text-gray-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors border border-transparent hover:border-emerald-500/20 group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold leading-tight">Reset Position & Size</span>
                  <span className="text-[10px] text-gray-400 truncate">Restore standard order & width split</span>
                </div>
              </button>

              {/* Reset Size Only */}
              <button
                onClick={() => {
                  onResetSizeOnly();
                  triggerFeedback('Reset sizes only!');
                  onClose();
                }}
                className="w-full text-left p-2 rounded-xl flex items-center gap-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-gray-700 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 transition-colors border border-transparent hover:border-blue-500/20 group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold leading-tight">Reset Size Only</span>
                  <span className="text-[10px] text-gray-400 truncate">Keep column order, reset default widths</span>
                </div>
              </button>

              {/* Reset Position Only */}
              <button
                onClick={() => {
                  onResetPositionOnly();
                  triggerFeedback('Reset column order only!');
                  onClose();
                }}
                className="w-full text-left p-2 rounded-xl flex items-center gap-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-gray-700 dark:text-gray-200 hover:text-purple-700 dark:hover:text-purple-400 transition-colors border border-transparent hover:border-purple-500/20 group"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold leading-tight">Reset Position Only</span>
                  <span className="text-[10px] text-gray-400 truncate">Keep custom widths, restore default order</span>
                </div>
              </button>

              {/* Clipboard Section */}
              <div className="mt-1 pt-1.5 border-t border-gray-100 dark:border-neutral-800">
                <span className="text-[10px] font-extrabold text-gray-400 px-1.5 uppercase tracking-wider block mb-1">
                  Share & Backup
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl flex items-center justify-center gap-1.5 bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200 text-xs font-bold border border-gray-200/60 dark:border-neutral-800 transition-all active:scale-98"
                  >
                    {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSuccess ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleNativePaste}
                    className="p-2 rounded-xl flex items-center justify-center gap-1.5 bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200 text-xs font-bold border border-gray-200/60 dark:border-neutral-800 transition-all active:scale-98"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Paste</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-gray-400 px-1.5 uppercase tracking-wider">
                Select Predefined Layout
              </span>
              {PREDEFINED_LAYOUTS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    onApplyPreset(preset);
                    triggerFeedback(`Applied "${preset.name}"!`);
                    onClose();
                  }}
                  className="w-full text-left p-2 rounded-xl flex flex-col gap-0.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-700 dark:text-gray-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors border border-transparent hover:border-emerald-500/20 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {preset.name}
                    </span>
                    <Columns3 className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="flex flex-col gap-2">
              {/* Save current trigger */}
              {!showSaveInput ? (
                <button
                  onClick={() => setShowSaveInput(true)}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Current Layout</span>
                </button>
              ) : (
                <form onSubmit={handleSaveSubmit} className="flex flex-col gap-1.5 p-2 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
                  <span className="text-[10.5px] font-bold text-gray-600 dark:text-gray-300">Name this layout:</span>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="e.g. My Multi-Task View"
                    autoFocus
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#1A1D23] border border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-gray-100 outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setShowSaveInput(false)}
                      className="px-2 py-1 rounded-md text-[10px] font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-neutral-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}

              {/* Saved list */}
              <div className="flex flex-col gap-1">
                {savedLayouts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400">
                    No custom saved layouts yet. Click above to save the current arrangement!
                  </div>
                ) : (
                  savedLayouts.map((item) => (
                    <div
                      key={item.id}
                      className="w-full p-2 rounded-xl flex items-center justify-between bg-gray-50/80 dark:bg-neutral-900/80 hover:bg-gray-100 dark:hover:bg-neutral-800/80 border border-gray-200/40 dark:border-neutral-800 transition-colors group"
                    >
                      <button
                        onClick={() => {
                          onApplySavedLayout(item);
                          triggerFeedback(`Applied "${item.name}"!`);
                          onClose();
                        }}
                        className="flex-1 text-left min-w-0"
                      >
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block truncate group-hover:text-emerald-500 transition-colors">
                          {item.name}
                        </span>
                        <span className="text-[9.5px] text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSavedLayout(item.id);
                          triggerFeedback(`Removed "${item.name}"`);
                        }}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                        title="Delete saved layout"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Manual Paste Modal Dialog (Fallback) */}
        {showPasteModal && (
          <div className="mt-1 p-2 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">Paste Layout JSON:</span>
            <textarea
              value={pasteInputText}
              onChange={(e) => setPasteInputText(e.target.value)}
              placeholder='{"columnOrder": ["switcher","chat","hub"], "panelSizes": {...}}'
              rows={3}
              className="w-full p-1.5 text-[10px] font-mono bg-white dark:bg-[#1A1D23] border border-gray-200 dark:border-neutral-700 rounded-lg text-gray-800 dark:text-gray-100 outline-none focus:border-emerald-500"
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-2 py-0.5 rounded text-[10px] font-bold text-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleManualPasteSubmit}
                className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-600 text-white"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
};
