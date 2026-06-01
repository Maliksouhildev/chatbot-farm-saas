const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./RunDataJsonActions-AF-htIet.js","./_plugin-vue_export-helper-BwBpWJRZ.js","./src-jviYSG25.js","./preload-helper-dyVz7ck7.js","./truncate-C0KYt7i3.js","./core-CRbPymLT.js","./vue.runtime.esm-bundler-tP5dCd7J.js","./chunk-6z4oVpB-.js","./CalendarDate-DgQUMbNo.js","./get-BcEmeOxn.js","./_MapCache-CcdIl4Ae.js","./sanitize-html-CbW56HUN.js","./empty-BuGRxzl4.js","./path-browserify-RUt2u7iT.js","./en-CF30SCh2.js","./constants-DU_MZhDK.js","./merge-DhuTk1HM.js","./builder.store-ui04SL1k.js","./_baseOrderBy-B7m9ONoX.js","./dateformat-hG8NERse.js","./useDebounce-Br5_1ug-.js","./useClipboard-Bhq71wY4.js","./usePinnedData-D7Ka5cbs.js"])))=>i.map(i=>d[i]);
import { C as computed, D as createElementBlock, E as createCommentVNode, Gt as unref, It as ref, M as createVNode, N as defineAsyncComponent, P as defineComponent, T as createBlock, bt as withCtx, et as openBlock, vn as normalizeClass, y as Suspense } from "./vue.runtime.esm-bundler-tP5dCd7J.js";
import { p as useElementSize } from "./core-CRbPymLT.js";
import { t as __vitePreload } from "./preload-helper-dyVz7ck7.js";
import { t as __plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BwBpWJRZ.js";
import "./truncate-C0KYt7i3.js";
import { Ki as shorten, N as useNDVStore, Rr as isString, Tn as getMappedExpression, di as executionDataToJson, k as useTelemetry, x as useExternalHooks } from "./builder.store-ui04SL1k.js";
import "./empty-BuGRxzl4.js";
import "./get-BcEmeOxn.js";
import "./_MapCache-CcdIl4Ae.js";
import { z as nonExistingJsonPath } from "./constants-DU_MZhDK.js";
import "./merge-DhuTk1HM.js";
import "./_baseOrderBy-B7m9ONoX.js";
import "./dateformat-hG8NERse.js";
import "./useDebounce-Br5_1ug-.js";
import { t as Draggable_default } from "./Draggable-BWpomiEt.js";
import { t as TextWithHighlights_default } from "./TextWithHighlights-BxumwGnv.js";
import { n as MappingPill_default, t as useTelemetryContext } from "./useTelemetryContext-C8VGZAJ4.js";
import { t as P } from "./vue-json-pretty-CsGX66mG.js";
var RunDataJson_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "RunDataJson",
	props: {
		editMode: { default: () => ({}) },
		pushRef: {},
		paneType: {},
		node: {},
		inputData: {},
		mappingEnabled: { type: Boolean },
		distanceFromActive: {},
		outputIndex: {},
		runIndex: {},
		totalRuns: {},
		search: {},
		compact: { type: Boolean },
		execution: {}
	},
	setup(__props) {
		const LazyRunDataJsonActions = defineAsyncComponent(async () => await __vitePreload(() => import("./RunDataJsonActions-AF-htIet.js"), __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]), import.meta.url));
		const props = __props;
		const ndvStore = useNDVStore();
		const externalHooks = useExternalHooks();
		const telemetry = useTelemetry();
		const telemetryContext = useTelemetryContext();
		const selectedJsonPath = ref(nonExistingJsonPath);
		const draggingPath = ref(null);
		const jsonDataContainer = ref(null);
		const { height } = useElementSize(jsonDataContainer);
		const jsonData = computed(() => executionDataToJson(props.inputData));
		const highlight$1 = computed(() => ndvStore.highlightDraggables);
		const getShortKey = (el) => {
			if (!el) return "";
			return shorten(el.dataset.name ?? "", 16, 2);
		};
		const getJsonParameterPath = (path) => {
			const subPath = path.replace(/^(\["?\d"?])/, "");
			return getMappedExpression({
				nodeName: props.node.name,
				distanceFromActive: props.distanceFromActive,
				path: subPath
			});
		};
		const canDraggableDrop = computed(() => ndvStore.canDraggableDrop);
		const draggableStickyPosition = computed(() => ndvStore.draggableStickyPos);
		const onDragStart = (el, data) => {
			if (el?.dataset.path) draggingPath.value = el.dataset.path;
			ndvStore.draggableStartDragging({
				type: "mapping",
				data: data ?? "",
				dimensions: el?.getBoundingClientRect() ?? null
			});
			ndvStore.resetMappingTelemetry();
		};
		const onDragEnd = (el) => {
			ndvStore.draggableStopDragging();
			draggingPath.value = null;
			const mappingTelemetry = ndvStore.mappingTelemetry;
			const telemetryPayload = {
				src_node_type: props.node.type,
				src_field_name: el.dataset.name ?? "",
				src_nodes_back: props.distanceFromActive,
				src_run_index: props.runIndex,
				src_runs_total: props.totalRuns,
				src_field_nest_level: el.dataset.depth ?? 0,
				src_view: "json",
				src_element: el,
				success: false,
				view_shown: telemetryContext.view_shown,
				...mappingTelemetry
			};
			setTimeout(() => {
				externalHooks.run("runDataJson.onDragEnd", telemetryPayload);
				telemetry.track("User dragged data for mapping", telemetryPayload);
			}, 1e3);
		};
		const formatKey = (value) => {
			return isString(value) ? `"${value}"` : JSON.stringify(value);
		};
		const formatValue = (value) => {
			return JSON.stringify(value);
		};
		const getListItemName = (path) => {
			return path.replace(/^(\["?\d"?]\.?)/g, "");
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", {
				ref_key: "jsonDataContainer",
				ref: jsonDataContainer,
				class: normalizeClass([_ctx.$style.jsonDisplay, {
					[_ctx.$style.highlight]: highlight$1.value,
					[_ctx.$style.compact]: props.compact
				}])
			}, [(openBlock(), createBlock(Suspense, null, {
				default: withCtx(() => [!_ctx.editMode.enabled ? (openBlock(), createBlock(unref(LazyRunDataJsonActions), {
					key: 0,
					node: _ctx.node,
					"pane-type": _ctx.paneType,
					"push-ref": _ctx.pushRef,
					"distance-from-active": _ctx.distanceFromActive,
					"selected-json-path": selectedJsonPath.value,
					"json-data": jsonData.value,
					"output-index": _ctx.outputIndex,
					"run-index": _ctx.runIndex,
					execution: _ctx.execution
				}, null, 8, [
					"node",
					"pane-type",
					"push-ref",
					"distance-from-active",
					"selected-json-path",
					"json-data",
					"output-index",
					"run-index",
					"execution"
				])) : createCommentVNode("", true)]),
				_: 1
			})), createVNode(Draggable_default, {
				type: "mapping",
				"target-data-key": "mappable",
				disabled: !_ctx.mappingEnabled,
				"can-drop": canDraggableDrop.value,
				"sticky-position": draggableStickyPosition.value,
				onDragstart: onDragStart,
				onDragend: onDragEnd
			}, {
				preview: withCtx(({ canDrop, el }) => [el ? (openBlock(), createBlock(MappingPill_default, {
					key: 0,
					html: getShortKey(el),
					"can-drop": canDrop
				}, null, 8, ["html", "can-drop"])) : createCommentVNode("", true)]),
				default: withCtx(() => [createVNode(unref(P), {
					data: jsonData.value,
					deep: 10,
					"show-length": true,
					"selected-value": selectedJsonPath.value,
					"root-path": "",
					"selectable-type": "single",
					class: "json-data",
					virtual: true,
					height: unref(height),
					"onUpdate:selectedValue": _cache[0] || (_cache[0] = ($event) => selectedJsonPath.value = $event)
				}, {
					renderNodeKey: withCtx(({ node }) => [createVNode(TextWithHighlights_default, {
						content: formatKey(node.key),
						search: _ctx.search,
						"data-target": "mappable",
						"data-value": getJsonParameterPath(node.path),
						"data-name": node.key,
						"data-path": node.path,
						"data-depth": node.level,
						class: normalizeClass({
							[_ctx.$style.mappable]: _ctx.mappingEnabled,
							[_ctx.$style.dragged]: draggingPath.value === node.path
						})
					}, null, 8, [
						"content",
						"search",
						"data-value",
						"data-name",
						"data-path",
						"data-depth",
						"class"
					])]),
					renderNodeValue: withCtx(({ node }) => [createVNode(TextWithHighlights_default, {
						content: formatValue(node.content),
						search: _ctx.search,
						"data-target": "mappable",
						"data-value": getJsonParameterPath(node.path),
						"data-name": getListItemName(node.path),
						"data-path": node.path,
						"data-depth": node.level,
						class: normalizeClass([{
							[_ctx.$style.mappable]: _ctx.mappingEnabled,
							[_ctx.$style.dragged]: draggingPath.value === node.path
						}, "ph-no-capture"])
					}, null, 8, [
						"content",
						"search",
						"data-value",
						"data-name",
						"data-path",
						"data-depth",
						"class"
					])]),
					_: 1
				}, 8, [
					"data",
					"selected-value",
					"height"
				])]),
				_: 1
			}, 8, [
				"disabled",
				"can-drop",
				"sticky-position"
			])], 2);
		};
	}
});
var RunDataJson_vue_vue_type_style_index_0_lang_module_default = {
	jsonDisplay: "_jsonDisplay_eimnw_123",
	mappable: "_mappable_eimnw_140",
	highlight: "_highlight_eimnw_146",
	dragged: "_dragged_eimnw_147",
	compact: "_compact_eimnw_152"
};
var RunDataJson_default = /* @__PURE__ */ __plugin_vue_export_helper_default(RunDataJson_vue_vue_type_script_setup_true_lang_default, [["__cssModules", { "$style": RunDataJson_vue_vue_type_style_index_0_lang_module_default }]]);
export { RunDataJson_default as default };
