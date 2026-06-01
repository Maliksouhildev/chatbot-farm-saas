import { It as ref, P as defineComponent, Pt as reactive, T as createBlock, et as openBlock } from "./vue.runtime.esm-bundler-tP5dCd7J.js";
import { rt as useI18n } from "./core-CRbPymLT.js";
import "./src-jviYSG25.js";
import "./en-CF30SCh2.js";
import "./preload-helper-dyVz7ck7.js";
import "./_plugin-vue_export-helper-BwBpWJRZ.js";
import "./truncate-C0KYt7i3.js";
import { Er as useUsersStore, ms as useSettingsStore, y as useToast } from "./builder.store-ui04SL1k.js";
import "./empty-BuGRxzl4.js";
import { v as useRouter } from "./get-BcEmeOxn.js";
import "./sanitize-html-CbW56HUN.js";
import "./CalendarDate-DgQUMbNo.js";
import "./path-browserify-RUt2u7iT.js";
import "./_MapCache-CcdIl4Ae.js";
import { Ro as VIEWS } from "./constants-DU_MZhDK.js";
import "./merge-DhuTk1HM.js";
import "./_baseOrderBy-B7m9ONoX.js";
import "./dateformat-hG8NERse.js";
import "./useDebounce-Br5_1ug-.js";
import "./sso.store-DyOYcJGS.js";
import { t as AuthView_default } from "./AuthView-D5cib1BY.js";
var SetupView_default = /* @__PURE__ */ defineComponent({
	__name: "SetupView",
	setup(__props) {
		const settingsStore = useSettingsStore();
		const usersStore = useUsersStore();
		const toast = useToast();
		const locale = useI18n();
		const router = useRouter();
		const loading = ref(false);
		const formConfig = reactive({
			title: locale.baseText("auth.setup.setupOwner"),
			buttonText: locale.baseText("auth.setup.next"),
			inputs: [
				{
					name: "email",
					properties: {
						label: locale.baseText("auth.email"),
						type: "email",
						required: true,
						validationRules: [{ name: "VALID_EMAIL" }],
						autocomplete: "email",
						capitalize: true
					}
				},
				{
					name: "firstName",
					properties: {
						label: locale.baseText("auth.firstName"),
						maxlength: 32,
						required: true,
						autocomplete: "given-name",
						capitalize: true
					}
				},
				{
					name: "lastName",
					properties: {
						label: locale.baseText("auth.lastName"),
						maxlength: 32,
						required: true,
						autocomplete: "family-name",
						capitalize: true
					}
				},
				{
					name: "password",
					properties: {
						label: locale.baseText("auth.password"),
						type: "password",
						required: true,
						validationRules: [{ name: "DEFAULT_PASSWORD_RULES" }],
						infoText: locale.baseText("auth.defaultPasswordRequirements"),
						autocomplete: "new-password",
						capitalize: true
					}
				},
				{
					name: "agree",
					properties: {
						label: locale.baseText("auth.agreement.label"),
						type: "checkbox"
					}
				}
			]
		});
		const onSubmit = async (values) => {
			try {
				const forceRedirectedHere = settingsStore.showSetupPage;
				loading.value = true;
				await usersStore.createOwner(values);
				if (values.agree === true) try {
					await usersStore.submitContactEmail(values.email.toString(), values.agree);
				} catch {}
				if (forceRedirectedHere) await router.push({ name: VIEWS.HOMEPAGE });
				else await router.push({ name: VIEWS.USERS_SETTINGS });
			} catch (error) {
				toast.showError(error, locale.baseText("auth.setup.settingUpOwnerError"));
			}
			loading.value = false;
		};
		return (_ctx, _cache) => {
			return openBlock(), createBlock(AuthView_default, {
				form: formConfig,
				"form-loading": loading.value,
				"data-test-id": "setup-form",
				onSubmit
			}, null, 8, ["form", "form-loading"]);
		};
	}
});
export { SetupView_default as default };
