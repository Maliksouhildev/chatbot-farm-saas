import { C as computed, E as createCommentVNode, P as defineComponent, T as createBlock, et as openBlock } from "./vue.runtime.esm-bundler-tP5dCd7J.js";
import "./core-CRbPymLT.js";
import "./src-jviYSG25.js";
import "./en-CF30SCh2.js";
import "./preload-helper-dyVz7ck7.js";
import "./_plugin-vue_export-helper-BwBpWJRZ.js";
import "./truncate-C0KYt7i3.js";
import { P as useWorkflowsStore } from "./builder.store-ui04SL1k.js";
import "./empty-BuGRxzl4.js";
import "./get-BcEmeOxn.js";
import "./sanitize-html-CbW56HUN.js";
import "./CalendarDate-DgQUMbNo.js";
import "./path-browserify-RUt2u7iT.js";
import "./_MapCache-CcdIl4Ae.js";
import "./constants-DU_MZhDK.js";
import "./merge-DhuTk1HM.js";
import "./_baseOrderBy-B7m9ONoX.js";
import "./dateformat-hG8NERse.js";
import "./useDebounce-Br5_1ug-.js";
import "./assistant.store-BAicudue.js";
import "./chatPanel.store-Ddte5n68.js";
import "./retry-BgHaYzbB.js";
import "./executions.store-p1bV--Zf.js";
import "./useRunWorkflow-ZBBsb2wv.js";
import "./usePinnedData-D7Ka5cbs.js";
import "./nodeCreator.store-CZ_ZQbL2.js";
import "./nodeIcon-nA6dlxxe.js";
import "./useClipboard-Bhq71wY4.js";
import "./useCanvasOperations-vFPZ8dBW.js";
import { t as LogsPanel_default } from "./LogsPanel-DRALk9er.js";
import "./folders.store-efW8H5U5.js";
import "./NodeIcon-wpmJLBSX.js";
import "./KeyboardShortcutTooltip-D8PAK5JP.js";
import "./isEmpty-bY5CgWGW.js";
import "./NDVEmptyState-33UoX00I.js";
import "./externalSecrets.ee.store-C1HQ2P5d.js";
import "./uniqBy-C4lhxRWe.js";
import "./RunDataHtml-Cleia4Cj.js";
import "./VueMarkdown-CQqJL9vK.js";
import "./schemaPreview.store-DjDHOlbw.js";
import "./vue-json-pretty-CsGX66mG.js";
import "./dateFormatter-ik4-9_9r.js";
import "./useExecutionHelpers-CUAn2LkV.js";
import "./useKeybindings-h_PEr8m9.js";
import "./fileUtils-CRWqOQje.js";
import "./core-CP5FY4aX.js";
import "./ChatFile-xZxmc2nV.js";
import "./xml-B_oj6Mle.js";
import "./AnimatedSpinner-DmPN4poP.js";
import "./useLogsTreeExpand-DDsiokgs.js";
import "./core-B9gt_4yk.js";
var DemoFooter_default = /* @__PURE__ */ defineComponent({
	__name: "DemoFooter",
	setup(__props) {
		const workflowsStore = useWorkflowsStore();
		const hasExecutionData = computed(() => workflowsStore.workflowExecutionData);
		return (_ctx, _cache) => {
			return hasExecutionData.value ? (openBlock(), createBlock(LogsPanel_default, {
				key: 0,
				"is-read-only": true
			})) : createCommentVNode("", true);
		};
	}
});
export { DemoFooter_default as default };
