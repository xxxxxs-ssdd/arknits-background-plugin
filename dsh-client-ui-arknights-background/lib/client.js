window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-arknights-background",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0dsh-css:D:\deepseekharness\deepseek-harness-master\packages\client\ui-arknights-background\src\client\arknights.module.css.mjs
		const css = "body{background:linear-gradient(#090c14d6 0%,#090c1442 38%,#0e0c1070 62%,#180d0ae0 100%),radial-gradient(130% 110% at 50% 18%,#0000 46%,#05070d85 100%),url(/arknights-wallpaper.webp) 50%/cover no-repeat}body:before{content:\"\";z-index:0;pointer-events:none;will-change:transform;background:radial-gradient(38% 34% at 24% 30%,#4668b233,#0000 72%),radial-gradient(34% 30% at 76% 62%,#96563e29,#0000 72%),radial-gradient(30% 28% at 62% 18%,#5880a81f,#0000 70%);animation:52s ease-in-out infinite alternate lKimca_dsh-arknights-aurora;position:fixed;inset:-28%}@keyframes lKimca_dsh-arknights-aurora{0%{transform:rotate(0)scale(1)}to{transform:rotate(14deg)scale(1.14)}}#root>div{background:0 0!important}#root>[data-slot=root]>div{--dsw-specific-sidebar-fill:linear-gradient(180deg, #10131ebd 0%, #0a0c1294 100%);background:0 0!important}[data-slot=conversation]>[data-phase],[data-composer-seat]{background:0 0!important}.md-code-block,[data-terminal],[data-read],[data-diff],[data-search],[data-web]{backdrop-filter:blur(12px);background:linear-gradient(#0a0e16cc 0%,#080b11a8 100%)!important}.md-code-block{--dsl-code-block-banner-background-color:#0a0e16b3}.md-code-block>div:first-child{background-color:#0000!important}.md-code-block :where(pre),.md-code-block :where(pre.lKimca_shiki),[data-terminal] :where(pre){background:0 0!important}@media (prefers-reduced-motion:reduce){body:before{animation:none}}";
		const tagId = "@deepseek-ai/dsh-client-ui-arknights-background/arknights.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-arknights-background";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region src/client/index.ts
		/** Client plugin body — the CSS import above is the whole effect. */
		function apply() {}
		//#endregion
		exports.apply = apply;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map