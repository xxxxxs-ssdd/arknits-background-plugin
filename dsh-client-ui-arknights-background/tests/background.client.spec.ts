/**
 * Background stylesheet contract, asserted against the CSS text on disk (the
 * plugin's entire effect is the injected sheet, so the sheet IS the unit under
 * test): the wallpaper URL is painted on `body` under a layered gradient veil,
 * a `body::before` aurora drifts above it, the full-viewport shell surfaces
 * (the AppFrame and the conversation column) are made transparent so the art
 * shows through, and the coding surfaces (markdown fences, terminal, and the
 * tool-output blocks) are frosted over the wallpaper with a gradient. The
 * apply functions of both halves are smoke-covered as no-ops.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { apply as applyBrowser } from '../src/client/index.ts'
import { apply as applyNode } from '../src/index.ts'

const css = readFileSync(fileURLToPath(new URL('../src/client/arknights.module.css', import.meta.url)), 'utf8')

describe('arknights background stylesheet', () => {
  it('paints the wallpaper on body under a layered gradient veil', () => {
    const bodyBlock = /body\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(bodyBlock).toContain("url('/arknights-wallpaper.webp')")
    expect(bodyBlock).toContain('center / cover no-repeat')
    // The gradient effect: a vertical linear veil plus a radial vignette.
    expect(bodyBlock).toContain('linear-gradient(')
    expect(bodyBlock).toContain('radial-gradient(')
    expect(bodyBlock.indexOf('linear-gradient(')).toBeLessThan(bodyBlock.indexOf('url('))
  })

  it('adds a slow aurora layer above the wallpaper', () => {
    const beforeBlock = /body::before\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(beforeBlock).toContain('position: fixed')
    expect(beforeBlock).toContain('pointer-events: none')
    expect(beforeBlock).toMatch(/animation:\s*dsh-arknights-aurora/)
    expect(css).toContain('@keyframes dsh-arknights-aurora')
    expect(css).toContain('prefers-reduced-motion')
  })

  it('lifts the full-viewport shell surfaces so the wallpaper shows through', () => {
    expect(css).toContain(":global(#root) > [data-slot='root'] > div")
    expect(css).toContain('background: transparent !important')
    expect(css).toContain('--dsw-specific-sidebar-fill')
    expect(css).toContain("[data-slot='conversation'] > [data-phase]")
    expect(css).toContain('[data-composer-seat]')
  })

  it('frosts the coding surfaces over the wallpaper with a gradient', () => {
    for (const selector of [':global(.md-code-block)', '[data-terminal]', '[data-read]', '[data-diff]', '[data-search]', '[data-web]']) {
      expect(css).toContain(selector)
    }
    expect(css).toContain('backdrop-filter: blur(12px)')
    expect(css).toContain('--dsl-code-block-banner-background-color')
    expect(css).toContain(':global(.md-code-block) :where(pre)')
    expect(css).toContain(':global(.md-code-block) :where(pre.shiki)')
  })
})

describe('plugin entrypoints', () => {
  it('both halves apply as no-ops', () => {
    expect(applyBrowser()).toBeUndefined()
    expect(applyNode()).toBeUndefined()
  })
})
