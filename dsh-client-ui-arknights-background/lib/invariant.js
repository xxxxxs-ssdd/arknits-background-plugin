//#region lib/types/invariant.js
/**
* Package-owned invariant companion for `@deepseek-ai/dsh-client-ui-arknights-background`.
* @module @deepseek-ai/dsh-client-ui-arknights-background/invariant
*/
const PACKAGE_NAME = "@deepseek-ai/dsh-client-ui-arknights-background";
/** Cordis companion plugin name. */
const name = "client-ui-arknights-background-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/**
* No runtime invariant: the plugin's entire effect is the injected stylesheet
* (a browser-only paint layer with no durable state or event protocol), and
* the style contract is asserted directly against the CSS text by this
* package's spec.
*/
const install = () => {};
/**
* Register this package's invariant companion.
* @param ctx - Cordis context carrying the invariant service.
* @returns The installed registration's disposer after setup succeeds.
*/
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
