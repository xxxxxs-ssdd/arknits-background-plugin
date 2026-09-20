/**
 * Background stylesheet contract, asserted against the CSS text on disk (the
 * plugin's entire effect is the injected sheet, so the sheet IS the unit under
 * test): the wallpaper URL is painted on `body` under a layered gradient veil,
 * a `body::before` aurora drifts above it, the full-viewport shell surfaces
 * (the AppFrame and the conversation column) are made transparent so the art
 * shows through, and the coding surfaces (markdown fences, terminal, and the
 * tool-output blocks) are frosted over the wallpaper with a gradient. The node
 * half is covered on its own contract: it registers one exact route serving the
 * packaged wallpaper on the path the client sheet paints, with the image MIME
 * and the packaged byte length, and stays inert when the composition has no
 * webserver.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { apply as applyBrowser } from '../src/client/index.ts'
import { apply as applyNode, WALLPAPER_PATH } from '../src/index.ts'

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
  interface FakeRequest {
    method: string
  }

  interface FakeResponse {
    writeHead: (status: number, headers?: Record<string, string>) => void
    end: (body?: Uint8Array) => void
  }

  interface CapturedRoute {
    kind: string
    path: string
    handler: (req: FakeRequest, res: FakeResponse) => void | Promise<void>
  }

  /** A context whose webserver stub captures the route the node half registers. */
  function hostContext(captured: CapturedRoute[]): Parameters<typeof applyNode>[0] {
    const webServer = { register: (route: CapturedRoute) => { captured.push(route); return () => undefined } }
    return {
      get: (name: string) => name === 'webServer' ? webServer : undefined,
      inject: () => undefined,
      effect: (callback: () => unknown) => { callback(); return () => undefined },
    } as unknown as Parameters<typeof applyNode>[0]
  }

  it('browser half applies as a no-op', () => {
    expect(applyBrowser()).toBeUndefined()
  })

  it('node half serves the packaged wallpaper on the path the sheet paints', async () => {
    const captured: CapturedRoute[] = []
    expect(applyNode(hostContext(captured))).toBeUndefined()
    expect(captured.map(route => [route.kind, route.path])).toEqual([['exact', WALLPAPER_PATH]])
    // The two halves cannot drift: the client sheet paints exactly this path.
    expect(css).toContain(`url('${WALLPAPER_PATH}')`)

    let status: number | undefined
    let headers: Record<string, string> = {}
    let body: Uint8Array | undefined
    await captured[0]!.handler({ method: 'GET' }, {
      writeHead: (next, nextHeaders) => { status = next; headers = nextHeaders ?? {} },
      end: (chunk) => { body = chunk },
    })

    const onDisk = readFileSync(fileURLToPath(new URL('../arknights-wallpaper.webp', import.meta.url)))
    expect(status).toBe(200)
    expect(headers['content-type']).toBe('image/webp')
    expect(headers['content-length']).toBe(String(onDisk.byteLength))
    expect(body?.byteLength).toBe(onDisk.byteLength)
  })

  it('node half waits for the webserver through inject when it is not mounted yet', () => {
    const captured: CapturedRoute[] = []
    const webServer = { register: (route: CapturedRoute) => { captured.push(route); return () => undefined } }
    const asked: string[][] = []
    const host = {
      get: () => undefined,
      inject: (deps: readonly string[], callback: (owner: unknown) => void) => {
        asked.push([...deps])
        callback({ webServer, effect: (fn: () => unknown) => { fn(); return () => undefined } })
        return () => undefined
      },
    }
    expect(applyNode(host as unknown as Parameters<typeof applyNode>[0])).toBeUndefined()
    expect(asked).toEqual([['webServer']])
    expect(captured.map(route => [route.kind, route.path])).toEqual([['exact', WALLPAPER_PATH]])
  })
})
