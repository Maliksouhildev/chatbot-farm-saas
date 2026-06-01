//#region src/utils/params.ts
function isThinkingEnabled(thinking) {
	return thinking.type === "enabled" || thinking.type === "adaptive";
}
function isOpus47Model(model) {
	return model?.startsWith("claude-opus-4-7") ?? false;
}
function getTaskBudgetBetas(model, outputConfig) {
	const hasTaskBudget = outputConfig && typeof outputConfig === "object" && "task_budget" in outputConfig && outputConfig.task_budget != null;
	return isOpus47Model(model) && hasTaskBudget ? ["task-budgets-2026-03-13"] : [];
}
function validateInvocationParamCompatibility(fields) {
	const { model, thinking, topK, topP, temperature } = fields;
	const opus47 = isOpus47Model(model);
	if (opus47 && thinking.type === "enabled") throw new Error("thinking.type=\"enabled\" is not supported for claude-opus-4-7; use thinking.type=\"adaptive\" instead");
	if (opus47 && typeof thinking === "object" && thinking != null && "budget_tokens" in thinking) throw new Error("thinking.budget_tokens is not supported for claude-opus-4-7; use outputConfig.effort instead");
	if (opus47) {
		if (topK !== void 0) throw new Error("topK is not supported for claude-opus-4-7; omit topK/topP/temperature or use model prompting instead");
		if (topP !== void 0 && topP !== 1) throw new Error("topP is not supported for claude-opus-4-7 when set to non-default values");
		if (temperature !== void 0 && temperature !== 1) throw new Error("temperature is not supported for claude-opus-4-7 when set to non-default values");
	}
	if (isThinkingEnabled(thinking)) {
		if (topK !== void 0) throw new Error("topK is not supported when thinking is enabled");
		if (topP !== void 0) throw new Error("topP is not supported when thinking is enabled");
		if (temperature !== void 0 && temperature !== 1) throw new Error("temperature is not supported when thinking is enabled");
	}
}
function getSamplingParams(fields) {
	const { model, thinking, topK, topP, temperature } = fields;
	const output = {};
	if (isThinkingEnabled(thinking) || isOpus47Model(model)) return output;
	if (temperature !== void 0) output.temperature = temperature;
	if (topK !== void 0) output.top_k = topK;
	if (topP !== void 0) output.top_p = topP;
	return output;
}
//#endregion
exports.getSamplingParams = getSamplingParams;
exports.getTaskBudgetBetas = getTaskBudgetBetas;
exports.validateInvocationParamCompatibility = validateInvocationParamCompatibility;

//# sourceMappingURL=params.cjs.map