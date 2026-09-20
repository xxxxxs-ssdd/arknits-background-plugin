/**
 * Arknights background plugin, node half: it serves the packaged wallpaper.
 *
 * The browser half paints `/arknights-wallpaper.webp` over the web shell. This
 * half owns that one byte-carrying asset, so the effect does not depend on the
 * composed frontend dist or on a deployment that hand-copied the image into it:
 * an exact route is registered on the webserver, and an exact route wins over
 * the frontend fallback seat — the seat where a missing file becomes a 404 and
 * the wallpaper silently never paints.
 *
 * Registration goes through the owning fiber (`ctx.effect`), so stopping,
 * updating, or removing the row withdraws the route with the rest of it. The
 * service is read optionally: a composition that mounts this package without a
 * webserver stays inert instead of waiting forever.
 */
import { readFile } from 'node:fs/promises'
import type { ServerResponse } from 'node:http'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-webserver'

/** Path the client stylesheet paints as the wallpaper. */
export const WALLPAPER_PATH = '/arknights-wallpaper.webp'

/** The wallpaper shipped beside the emitted JavaScript (package root). */
const WALLPAPER_FILE = fileURLToPath(new URL('../arknights-wallpaper.webp', import.meta.url))

const IMAGE_WEBP = 'image/webp'

/** One lazily read copy of the wallpaper bytes, owned by the plugin fiber. */
interface WallpaperCache {
  bytes?: Buffer
}

/**
 * Serve the packaged wallpaper on the browser's fixed path. GET and HEAD are
 * answered; any other method is 405, and a package that lost its asset (a
 * partial install) answers 404 rather than failing the request.
 * @param cache - fiber-owned byte cache, filled on the first request.
 * @param method - the request method.
 * @param res - the node:http response to write.
 */
async function serveWallpaper(cache: WallpaperCache, method: string | undefined, res: ServerResponse): Promise<void> {
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405)
    res.end()
    return
  }
  if (cache.bytes === undefined) {
    try {
      cache.bytes = await readFile(WALLPAPER_FILE)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      res.writeHead(404)
      res.end()
      return
    }
  }
  const bytes = cache.bytes
  res.writeHead(200, {
    'content-type': IMAGE_WEBP,
    'content-length': String(bytes.byteLength),
    // Immutable per package version; an hour keeps a swapped art file visible
    // without re-downloading it on every page load.
    'cache-control': 'public, max-age=3600',
  })
  res.end(method === 'HEAD' ? undefined : bytes)
}

/** Host plugin body: one exact route for the packaged wallpaper. */
export function apply(ctx: Context): void {
  const cache: WallpaperCache = {}
  const register = (owner: Context, webServer: Context['webServer']): void => {
    owner.effect(
      () => webServer.register({
        kind: 'exact',
        path: WALLPAPER_PATH,
        handler: (req, res) => serveWallpaper(cache, req.method, res),
      }),
      'ui-arknights-background: wallpaper route',
    )
  }
  const webServer = ctx.get('webServer')
  if (webServer === undefined) ctx.inject(['webServer'], host => register(host, host.webServer))
  else register(ctx, webServer)
}
