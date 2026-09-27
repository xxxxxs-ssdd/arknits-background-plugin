# @deepseek-ai/dsh-client-ui-arknights-background

English | [中文](README.zh.md)

Web background plugin: paints the Arknights wallpaper over the web shell. The client bundle's entire effect is one stylesheet (`src/client/arknights.module.css`), injected as a `<style data-plugin>` tag when the bundle materializes; the node half owns the art itself, registering one exact `/arknights-wallpaper.webp` route that serves the packaged `arknights-wallpaper.webp`, so the effect no longer depends on the deployment's frontend dist. The package ships its own composition layer (`dsh.bundle` + `cordis.patch.yml`), so `dsh plugin --profile web add <package>` mounts the browser row without hand-editing a profile patch.

The sheet paints the wallpaper on `html` and `body` under two gradient layers — a vertical readability veil whose stops follow the art's own shading (dark blue-gray sky, light center, warm dark foreground) plus a radial vignette — and a `body::before` aurora of two soft color glows slowly rotates and scales above the wallpaper (disabled under `prefers-reduced-motion`). The full-viewport shell surfaces are lifted so the art shows through: every slot render is wrapped in a `[data-slot="<key>"]` anchor (`display: contents`), so the AppFrame (`#root > [data-slot="root"] > div`) becomes transparent and the conversation column root (`[data-slot="conversation"] > [data-phase]`) is lifted too, with the composer seat's fade band cleared as well; the sidebar keeps a translucent dark gradient through its `--dsw-specific-sidebar-fill` token. The right sidebar is a dockkit tree whose docked pane box carries the opaque base token — the box that hid the wallpaper when a file was open — so `[data-dockkit-host='dock'] > [data-dockkit-pane]` is lifted to transparent while floating panes stay opaque. The coding surfaces — markdown code fences (`.md-code-block`), the terminal/file-read/diff/search/web tool blocks (`[data-terminal]`, `[data-read]`, `[data-diff]`, `[data-search]`, `[data-web]`), and the sidebar code preview (`[data-code-preview]`) — become frosted glass over the wallpaper: a translucent gradient fill plus a 12px backdrop blur, with the fence banner and inner `pre` made transparent, so code stays readable while the art shows through. Cards, dialogs, and floating panels keep their own opaque token backgrounds, so dense UI stays legible.

The shell selectors track the slot-system DOM rather than hashed class names (documented in the stylesheet): each slot render is anchored by a `[data-slot="<key>"]` wrapper, the AppFrame is its `> div`, and `[data-phase]` is the conversation column root's always-present attribute (the shell keys that slot `main.conversation`, so the sheet matches it by suffix as well as by the literal key). Both are asserted by the package spec. Every rule is plain CSS — no `:global()` wrappers: the sheet is compiled into the bundle ahead of Vite's CSS-modules pass, so a `:global(...)` selector would reach the browser verbatim, where it is an unknown pseudo-class and its whole rule is dropped (that is what silently disabled this sheet's transparency rules).

## Model Experience

None, as the plugin is a browser-side paint layer plus one static image route; nothing here reaches a model request.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

- **Structural selectors** — the transparency overrides match the shell DOM positionally; a future shell that wraps the AppFrame or the conversation root in another element would need the selectors updated (the spec pins the current contract).
- **Fixed image URL** — the painted path is a package literal (`/arknights-wallpaper.webp`); the node half serves it from the packaged `arknights-wallpaper.webp`, so swapping the art means replacing that one file in the package (no stylesheet or frontend-dist change).
