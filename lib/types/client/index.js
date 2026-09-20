/**
 * Arknights background plugin, browser half: a stylesheet-only contribution.
 *
 * Importing the stylesheet is the entire effect — the tsdown CSS pipeline
 * injects a `<style data-plugin>` tag when the bundle factory materializes,
 * painting the wallpaper, the gradient veil, and the aurora over the web
 * shell. The apply body stays empty (the same shape as the ui-user-questions
 * Node half): there are no services, slots, or locale dictionaries to
 * register.
 *
 * Export discipline: packages/client/AGENTS.md.
 */
import './arknights.module.css';
/** Client plugin body — the CSS import above is the whole effect. */
export function apply() { }
//# sourceMappingURL=index.js.map