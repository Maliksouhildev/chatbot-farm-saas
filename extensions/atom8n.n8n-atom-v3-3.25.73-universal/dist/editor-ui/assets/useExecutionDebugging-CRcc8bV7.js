import { C as computed, L as h } from "./vue.runtime.esm-bundler-tP5dCd7J.js";
import { rt as useI18n } from "./core-CRbPymLT.js";
import { D as sanitizeHtml, Jn as useWorkflowState, Mr as isFullExecutionResponse, P as useWorkflowsStore, aa as useUIStore, h as useMessage, k as useTelemetry, ms as useSettingsStore, ns as DEBUG_PAYWALL_MODAL_KEY, qn as injectWorkflowState, r as useWorkflowFileSync, y as useToast } from "./builder.store-ui04SL1k.js";
import { v as useRouter } from "./get-BcEmeOxn.js";
import { Ro as VIEWS, Vi as createRunExecutionData, rs as MODAL_CONFIRM, yc as EnterpriseEditionFeature } from "./constants-DU_MZhDK.js";
import { r as useRootStore } from "./_baseOrderBy-B7m9ONoX.js";
import { t as usePageRedirectionHelper } from "./usePageRedirectionHelper-B3ao8qWG.js";
const useExecutionDebugging = () => {
	const telemetry = useTelemetry();
	const router = useRouter();
	const i18n = useI18n();
	const message = useMessage();
	const toast = useToast();
	const workflowsStore = useWorkflowsStore();
	let workflowState;
	try {
		workflowState = injectWorkflowState();
	} catch {
		workflowState = useWorkflowState();
	}
	const settingsStore = useSettingsStore();
	const uiStore = useUIStore();
	const pageRedirectionHelper = usePageRedirectionHelper();
	const isDebugEnabled = computed(() => settingsStore.isEnterpriseFeatureEnabled[EnterpriseEditionFeature.DebugInEditor]);
	const applyExecutionData = async (executionId) => {
		const execution = await workflowsStore.getExecution(executionId);
		const workflowObject = workflowsStore.workflowObject;
		const workflowNodes = workflowsStore.getNodes();
		if (!execution?.data?.resultData) return;
		const { runData } = execution.data.resultData;
		const executionNodeNames = Object.keys(runData);
		const missingNodeNames = executionNodeNames.filter((name) => !workflowNodes.some((node) => node.name === name));
		const workflowPinnedNodeNames = Object.keys(workflowsStore.workflow.pinData ?? {});
		const matchingPinnedNodeNames = executionNodeNames.filter((name) => workflowPinnedNodeNames.includes(name));
		if (matchingPinnedNodeNames.length > 0) {
			const confirmMessage = h("p", [i18n.baseText("nodeView.confirmMessage.debug.message"), h("ul", { class: "mt-l ml-l" }, matchingPinnedNodeNames.map((name) => h("li", sanitizeHtml(name))))]);
			if (await message.confirm(confirmMessage, i18n.baseText("nodeView.confirmMessage.debug.headline"), {
				type: "warning",
				confirmButtonText: i18n.baseText("nodeView.confirmMessage.debug.confirmButtonText"),
				cancelButtonText: i18n.baseText("nodeView.confirmMessage.debug.cancelButtonText"),
				customClass: "matching-pinned-nodes-confirmation"
			}) === "confirm") matchingPinnedNodeNames.forEach((name) => {
				const node = workflowsStore.getNodeByName(name);
				if (node) workflowsStore.unpinData({ node });
			});
			else {
				await router.push({
					name: VIEWS.EXECUTION_PREVIEW,
					params: {
						name: workflowObject.id,
						executionId
					}
				});
				return;
			}
		}
		workflowState.resetAllNodesIssues();
		workflowState.setWorkflowExecutionData(execution);
		const pinnableNodes = workflowNodes.filter((node) => !workflowObject.getParentNodes(node.name).length);
		let pinnings = 0;
		pinnableNodes.forEach((node) => {
			const taskData = runData[node.name]?.[0];
			if (taskData?.data?.main) {
				const nodeData = taskData.data.main.find((output) => output && output.length > 0);
				if (nodeData) {
					pinnings++;
					workflowsStore.pinData({
						node,
						data: nodeData,
						isRestoration: true
					});
				}
			}
		});
		toast.showToast({
			title: i18n.baseText("nodeView.showMessage.debug.title"),
			message: i18n.baseText("nodeView.showMessage.debug.content"),
			type: "info"
		});
		if (missingNodeNames.length) toast.showToast({
			title: i18n.baseText("nodeView.showMessage.debug.missingNodes.title"),
			message: i18n.baseText("nodeView.showMessage.debug.missingNodes.content", { interpolate: { nodeNames: missingNodeNames.join(", ") } }),
			type: "warning"
		});
		telemetry.track("User clicked debug execution button", {
			instance_id: useRootStore().instanceId,
			exec_status: isFullExecutionResponse(execution) ? execution.status : "",
			override_pinned_data: pinnableNodes.length === pinnings,
			all_exec_data_imported: missingNodeNames.length === 0
		});
		const workflowFileSync = useWorkflowFileSync();
		const currentWorkflowData = workflowFileSync.getCurrentWorkflowData();
		if (currentWorkflowData) {
			const executionRunData = execution.data?.resultData?.runData;
			const executionTiming = {
				startedAt: execution.startedAt,
				stoppedAt: execution.stoppedAt
			};
			workflowFileSync.syncWorkflowToFile(currentWorkflowData, true, executionRunData, executionTiming);
		}
	};
	const handleDebugLinkClick = (event) => {
		if (!isDebugEnabled.value) {
			uiStore.openModalWithData({
				name: DEBUG_PAYWALL_MODAL_KEY,
				data: {
					title: i18n.baseText("executionsList.debug.paywall.title"),
					footerButtonAction: () => {
						uiStore.closeModal(DEBUG_PAYWALL_MODAL_KEY);
						pageRedirectionHelper.goToUpgrade("debug", "upgrade-debug");
					}
				}
			});
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		workflowsStore.isInDebugMode = false;
	};
	const applyRunDataFromFile = async (runData) => {
		const workflowObject = workflowsStore.workflowObject;
		const workflowNodes = workflowsStore.getNodes();
		if (!runData || typeof runData !== "object") {
			toast.showError(/* @__PURE__ */ new Error("Invalid runData provided"), "Failed to load data");
			return;
		}
		const executionNodeNames = Object.keys(runData);
		const missingNodeNames = executionNodeNames.filter((name) => !workflowNodes.some((node) => node.name === name));
		const workflowPinnedNodeNames = Object.keys(workflowsStore.workflow.pinData ?? {});
		const matchingPinnedNodeNames = executionNodeNames.filter((name) => workflowPinnedNodeNames.includes(name));
		if (matchingPinnedNodeNames.length > 0) {
			const confirmMessage = h("p", [i18n.baseText("nodeView.confirmMessage.debug.message"), h("ul", { class: "mt-l ml-l" }, matchingPinnedNodeNames.map((name) => h("li", sanitizeHtml(name))))]);
			if (await message.confirm(confirmMessage, i18n.baseText("nodeView.confirmMessage.debug.headline"), {
				type: "warning",
				confirmButtonText: i18n.baseText("nodeView.confirmMessage.debug.confirmButtonText"),
				cancelButtonText: i18n.baseText("nodeView.confirmMessage.debug.cancelButtonText"),
				customClass: "matching-pinned-nodes-confirmation"
			}) === "confirm") matchingPinnedNodeNames.forEach((name) => {
				const node = workflowsStore.getNodeByName(name);
				if (node) workflowsStore.unpinData({ node });
			});
			else return;
		}
		workflowState.resetAllNodesIssues();
		const executionData = {
			id: "loaded-from-file",
			finished: true,
			mode: "manual",
			status: "success",
			createdAt: /* @__PURE__ */ new Date(),
			startedAt: /* @__PURE__ */ new Date(),
			stoppedAt: /* @__PURE__ */ new Date(),
			workflowId: workflowsStore.workflowId,
			data: createRunExecutionData({ resultData: { runData } }),
			workflowData: workflowsStore.workflow
		};
		workflowState.setWorkflowExecutionData(executionData);
		const pinnableNodes = workflowNodes.filter((node) => !workflowObject.getParentNodes(node.name).length);
		let pinnings = 0;
		pinnableNodes.forEach((node) => {
			const taskData = runData[node.name]?.[0];
			if (taskData?.data?.main) {
				const nodeData = taskData.data.main.find((output) => output && output.length > 0);
				if (nodeData) {
					pinnings++;
					workflowsStore.pinData({
						node,
						data: nodeData,
						isRestoration: true
					});
				}
			}
		});
		toast.showToast({
			title: i18n.baseText("nodeView.showMessage.debug.title"),
			message: i18n.baseText("nodeView.showMessage.debug.content"),
			type: "info"
		});
		if (missingNodeNames.length) toast.showToast({
			title: i18n.baseText("nodeView.showMessage.debug.missingNodes.title"),
			message: i18n.baseText("nodeView.showMessage.debug.missingNodes.content", { interpolate: { nodeNames: missingNodeNames.join(", ") } }),
			type: "warning"
		});
	};
	return {
		applyExecutionData,
		handleDebugLinkClick,
		applyRunDataFromFile
	};
};
export { useExecutionDebugging as t };
