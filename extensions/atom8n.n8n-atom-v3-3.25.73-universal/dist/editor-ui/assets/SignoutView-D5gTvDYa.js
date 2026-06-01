import { D as createElementBlock, P as defineComponent, Z as onMounted, et as openBlock } from "./vue.runtime.esm-bundler-tP5dCd7J.js";
import "./empty-BuGRxzl4.js";
import { v as useRouter } from "./get-BcEmeOxn.js";
import "./_MapCache-CcdIl4Ae.js";
import { Ro as VIEWS } from "./constants-DU_MZhDK.js";
import "./merge-DhuTk1HM.js";
var SignoutView_default = /* @__PURE__ */ defineComponent({
	__name: "SignoutView",
	setup(__props) {
		const router = useRouter();
		onMounted(() => {
			router.push({ name: VIEWS.HOMEPAGE });
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div");
		};
	}
});
export { SignoutView_default as default };
