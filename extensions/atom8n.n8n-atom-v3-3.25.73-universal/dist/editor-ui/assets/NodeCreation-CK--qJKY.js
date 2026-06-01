const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./NodeCreator-yzZ6s6Jg.js","./_plugin-vue_export-helper-BwBpWJRZ.js","./src-jviYSG25.js","./preload-helper-dyVz7ck7.js","./truncate-C0KYt7i3.js","./core-CRbPymLT.js","./vue.runtime.esm-bundler-tP5dCd7J.js","./chunk-6z4oVpB-.js","./CalendarDate-DgQUMbNo.js","./get-BcEmeOxn.js","./_MapCache-CcdIl4Ae.js","./sanitize-html-CbW56HUN.js","./empty-BuGRxzl4.js","./path-browserify-RUt2u7iT.js","./en-CF30SCh2.js","./nodeCreator.store-CZ_ZQbL2.js","./constants-DU_MZhDK.js","./merge-DhuTk1HM.js","./builder.store-ui04SL1k.js","./_baseOrderBy-B7m9ONoX.js","./dateformat-hG8NERse.js","./useDebounce-Br5_1ug-.js","./nodeIcon-nA6dlxxe.js","./exports-Crx_gvt_.js","./useCanvasOperations-vFPZ8dBW.js","./useClipboard-Bhq71wY4.js","./usePinnedData-D7Ka5cbs.js","./folders.store-efW8H5U5.js","./executions.store-p1bV--Zf.js","./semver-BXkb4_6Q.js","./banners.store-Bw2Xqir-.js","./assistant.store-BAicudue.js","./NodeIcon-wpmJLBSX.js","./ItemsRenderer-Cm8bJnP2.js","./useActions-C9lpSktE.js","./chatPanel.store-Ddte5n68.js","./CommunityNodeUpdateInfo-DQm57TdL.js"])))=>i.map(i=>d[i]);
import { Cn as toDisplayString, D as createElementBlock, E as createCommentVNode, G as nextTick, Gt as unref, M as createVNode, N as defineAsyncComponent, P as defineComponent, T as createBlock, _ as Fragment, bt as withCtx, et as openBlock, j as createTextVNode, vn as normalizeClass, w as createBaseVNode, y as Suspense } from "./vue.runtime.esm-bundler-tP5dCd7J.js";
import { rt as useI18n } from "./core-CRbPymLT.js";
import { ft as AskAssistantIcon_default, ht as N8nTooltip_default, xn as N8nButton_default, xt as N8nIconButton_default } from "./src-jviYSG25.js";
import "./en-CF30SCh2.js";
import { t as __vitePreload } from "./preload-helper-dyVz7ck7.js";
import { t as __plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BwBpWJRZ.js";
import "./truncate-C0KYt7i3.js";
import { aa as useUIStore, i as useFocusPanelStore, k as useTelemetry, q as getMidCanvasPosition, t as useBuilderStore } from "./builder.store-ui04SL1k.js";
import "./empty-BuGRxzl4.js";
import "./get-BcEmeOxn.js";
import "./sanitize-html-CbW56HUN.js";
import "./CalendarDate-DgQUMbNo.js";
import "./path-browserify-RUt2u7iT.js";
import "./_MapCache-CcdIl4Ae.js";
import { St as NODE_CREATOR_OPEN_SOURCES, U as DEFAULT_STICKY_HEIGHT, W as DEFAULT_STICKY_WIDTH, sr as STICKY_NODE_TYPE } from "./constants-DU_MZhDK.js";
import "./merge-DhuTk1HM.js";
import "./_baseOrderBy-B7m9ONoX.js";
import "./dateformat-hG8NERse.js";
import "./useDebounce-Br5_1ug-.js";
import { t as useAssistantStore } from "./assistant.store-BAicudue.js";
import { t as useChatPanelStore } from "./chatPanel.store-Ddte5n68.js";
import "./retry-BgHaYzbB.js";
import "./executions.store-p1bV--Zf.js";
import "./useRunWorkflow-ZBBsb2wv.js";
import "./usePinnedData-D7Ka5cbs.js";
import "./nodeCreator.store-CZ_ZQbL2.js";
import "./nodeIcon-nA6dlxxe.js";
import "./useClipboard-Bhq71wY4.js";
import "./useCanvasOperations-vFPZ8dBW.js";
import "./folders.store-efW8H5U5.js";
import "./NodeIcon-wpmJLBSX.js";
import { t as KeyboardShortcutTooltip_default } from "./KeyboardShortcutTooltip-D8PAK5JP.js";
import "./versions.store-iyqwFaCX.js";
import "./usePageRedirectionHelper-B3ao8qWG.js";
import "./dataTable.store-DHfH6l7n.js";
import { t as useCommandBar } from "./useCommandBar-Cms5DkWk.js";
import "./uniqBy-C4lhxRWe.js";
import "./ProjectIcon-DY8gGuHX.js";
import "./CredentialIcon-CouZ7DP2.js";
import "./sortByProperty-Cn7iGKYu.js";
import "./constants-CC9PBxB_.js";
import "./useRecentResources-DICnM1Vx.js";
import { t as useActions } from "./useActions-C9lpSktE.js";
import "./chat.store-MVfeqLeG.js";
import "./fileUtils-CRWqOQje.js";
var NodeCreation_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "NodeCreation",
	props: {
		nodeViewScale: {},
		createNodeActive: {
			type: Boolean,
			default: false
		},
		focusPanelActive: { type: Boolean }
	},
	emits: [
		"addNodes",
		"toggleNodeCreator",
		"close"
	],
	setup(__props, { emit: __emit }) {
		const LazyNodeCreator = defineAsyncComponent(async () => await __vitePreload(() => import("./NodeCreator-yzZ6s6Jg.js"), __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36]), import.meta.url));
		const props = __props;
		const emit = __emit;
		const uiStore = useUIStore();
		const focusPanelStore = useFocusPanelStore();
		const i18n = useI18n();
		const telemetry = useTelemetry();
		const assistantStore = useAssistantStore();
		const builderStore = useBuilderStore();
		const chatPanelStore = useChatPanelStore();
		const { isEnabled: isCommandBarEnabled } = useCommandBar();
		const { getAddedNodesAndConnections } = useActions();
		function openNodeCreator() {
			emit("toggleNodeCreator", {
				source: NODE_CREATOR_OPEN_SOURCES.ADD_NODE_BUTTON,
				createNodeActive: true
			});
		}
		function addStickyNote() {
			if (document.activeElement) document.activeElement.blur();
			const offset = [...uiStore.nodeViewOffsetPosition];
			const position = getMidCanvasPosition(props.nodeViewScale, offset);
			position[0] -= 240 / 2;
			position[1] -= 160 / 2;
			emit("addNodes", getAddedNodesAndConnections([{
				type: STICKY_NODE_TYPE,
				position
			}]));
		}
		function closeNodeCreator(hasAddedNodes = false) {
			if (props.createNodeActive) emit("toggleNodeCreator", {
				createNodeActive: false,
				hasAddedNodes
			});
			emit("close");
		}
		function nodeTypeSelected(value) {
			emit("addNodes", getAddedNodesAndConnections(value));
			closeNodeCreator(true);
		}
		function toggleFocusPanel() {
			focusPanelStore.toggleFocusPanel();
			telemetry.track(focusPanelStore.focusPanelActive ? "User opened focus panel" : "User closed focus panel", {
				source: "canvasButton",
				parameters: focusPanelStore.focusedNodeParametersInTelemetryFormat
			});
		}
		async function onAskAssistantButtonClick() {
			if (builderStore.isAIBuilderEnabled) await chatPanelStore.toggle({ mode: "builder" });
			else await chatPanelStore.toggle({ mode: "assistant" });
			if (chatPanelStore.isOpen) assistantStore.trackUserOpenedAssistant({
				source: "canvas",
				task: "placeholder",
				has_existing_session: !assistantStore.isSessionEnded
			});
		}
		function openCommandBar(event) {
			event.stopPropagation();
			nextTick(() => {
				const keyboardEvent = new KeyboardEvent("keydown", {
					key: "k",
					code: "KeyK",
					metaKey: true,
					bubbles: true,
					cancelable: true
				});
				document.dispatchEvent(keyboardEvent);
			});
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock(Fragment, null, [!_ctx.createNodeActive ? (openBlock(), createElementBlock("div", {
				key: 0,
				class: normalizeClass(_ctx.$style.nodeButtonsWrapper)
			}, [
				createVNode(KeyboardShortcutTooltip_default, {
					label: unref(i18n).baseText("nodeView.openNodesPanel"),
					shortcut: { keys: ["Tab"] },
					placement: "left"
				}, {
					default: withCtx(() => [createVNode(unref(N8nIconButton_default), {
						size: "large",
						icon: "plus",
						type: "tertiary",
						"data-test-id": "node-creator-plus-button",
						onClick: openNodeCreator
					})]),
					_: 1
				}, 8, ["label"]),
				unref(isCommandBarEnabled) ? (openBlock(), createBlock(KeyboardShortcutTooltip_default, {
					key: 0,
					label: unref(i18n).baseText("nodeView.openCommandBar"),
					shortcut: {
						keys: ["k"],
						metaKey: true
					},
					placement: "left"
				}, {
					default: withCtx(() => [createVNode(unref(N8nIconButton_default), {
						size: "large",
						icon: "search",
						type: "tertiary",
						"data-test-id": "command-bar-button",
						onClick: openCommandBar
					})]),
					_: 1
				}, 8, ["label"])) : createCommentVNode("", true),
				createVNode(KeyboardShortcutTooltip_default, {
					label: unref(i18n).baseText("nodeView.addStickyHint"),
					shortcut: {
						keys: ["s"],
						shiftKey: true
					},
					placement: "left"
				}, {
					default: withCtx(() => [createVNode(unref(N8nIconButton_default), {
						size: "large",
						type: "tertiary",
						icon: "sticky-note",
						"data-test-id": "add-sticky-button",
						onClick: addStickyNote
					})]),
					_: 1
				}, 8, ["label"]),
				createVNode(KeyboardShortcutTooltip_default, {
					label: unref(i18n).baseText("nodeView.openFocusPanel"),
					shortcut: {
						keys: ["f"],
						shiftKey: true
					},
					placement: "left"
				}, {
					default: withCtx(() => [createVNode(unref(N8nIconButton_default), {
						type: "tertiary",
						size: "large",
						icon: "panel-right",
						class: normalizeClass(_ctx.focusPanelActive ? _ctx.$style.activeButton : ""),
						active: _ctx.focusPanelActive,
						"data-test-id": "toggle-focus-panel-button",
						onClick: toggleFocusPanel
					}, null, 8, ["class", "active"])]),
					_: 1
				}, 8, ["label"]),
				unref(chatPanelStore).canShowAiButtonOnCanvas ? (openBlock(), createBlock(unref(N8nTooltip_default), {
					key: 1,
					placement: "left"
				}, {
					content: withCtx(() => [createTextVNode(toDisplayString(unref(i18n).baseText("aiAssistant.tooltip")), 1)]),
					default: withCtx(() => [createVNode(unref(N8nButton_default), {
						type: "tertiary",
						size: "large",
						square: "",
						class: normalizeClass(_ctx.$style.icon),
						"data-test-id": "ask-assistant-canvas-action-button",
						onClick: onAskAssistantButtonClick
					}, {
						default: withCtx(() => [createBaseVNode("div", null, [createVNode(unref(AskAssistantIcon_default), { size: "large" })])]),
						_: 1
					}, 8, ["class"])]),
					_: 1
				})) : createCommentVNode("", true)
			], 2)) : createCommentVNode("", true), (openBlock(), createBlock(Suspense, null, {
				default: withCtx(() => [createVNode(unref(LazyNodeCreator), {
					active: _ctx.createNodeActive,
					onNodeTypeSelected: nodeTypeSelected,
					onCloseNodeCreator: closeNodeCreator
				}, null, 8, ["active"])]),
				_: 1
			}))], 64);
		};
	}
});
var NodeCreation_vue_vue_type_style_index_0_lang_module_default = {
	nodeButtonsWrapper: "_nodeButtonsWrapper_13o6j_123",
	icon: "_icon_13o6j_134",
	activeButton: "_activeButton_13o6j_143"
};
var NodeCreation_default = /* @__PURE__ */ __plugin_vue_export_helper_default(NodeCreation_vue_vue_type_script_setup_true_lang_default, [["__cssModules", { "$style": NodeCreation_vue_vue_type_style_index_0_lang_module_default }]]);
export { NodeCreation_default as default };
