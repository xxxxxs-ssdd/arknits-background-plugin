# 明日方舟背景插件 — 安装说明

本包是 DeepSeek Harness Web 界面的背景插件：把明日方舟壁纸作为整个应用的背景，叠加渐变纱幕与缓慢流动的极光层，并让聊天区、代码块、终端等编码表面变成"毛玻璃"（半透明渐变 + 背景模糊）。

**本版本（0.1.0-rc.6）是自包含版。** 插件把壁纸随包分发，并由自己的 Node 半边在 `/arknights-wallpaper.webp` 注册**精确路由**提供该资源（精确路由优先于前端静态兜底），同时包内自带组合层（声明 `dsh.bundle` + `cordis.patch.yml`）。因此安装后：

- **不需要**把图片复制到前端目录（`apps/web/public` / 前端 `dist`）——旧版最容易踩的坑；
- **不需要**手改 profile 的 `cordis.patch.yml`。

## 目录结构

```
dsh-client-ui-arknights-background/
├── package.json            # 可发布清单（npm/pnpm pack 就绪）
├── cordis.patch.yml        # 包自带的组合层：插入 ui-arknights-background 行
├── lib/                    # 已构建产物（Node 半边 + 浏览器 bundle）
│   ├── index.js            # Node 半边：注册壁纸路由
│   ├── invariant.js
│   ├── client.js           # 浏览器 bundle（内嵌全部样式，自注入 <style>）
│   └── types/              # 类型声明
├── src/                    # 源码
├── tests/                  # 测试（断言样式契约 + 壁纸路由契约）
├── arknights-wallpaper.webp  # 壁纸资源（随包分发）
└── README.md / README.zh.md
```

## 方式一：任意 DSH 部署（推荐，一条命令）

前提：你的机器上 `dsh` 能正常启动 Web（`dsh web`）。

1. 安装到 Web profile（用随包的 tarball，或安装已发布到 registry 的同名包）：

   ```bash
   dsh plugin --profile web add ./deepseek-ai-dsh-client-ui-arknights-background-0.1.0-rc.6.tgz
   # 或：dsh plugin --profile web add @deepseek-ai/dsh-client-ui-arknights-background
   ```

   因为本包声明了 `dsh.bundle`，`dsh plugin add` 会把它并入该 profile 的组合层，其 `cordis.patch.yml` 自动插入 `ui-arknights-background` 行。

2. 重启 `dsh web`（关闭当前窗口后重新运行，例如 `deepseekopen.cmd` / `pnpm dsh web`），然后刷新浏览器。

3. 验证：
   - `GET http://<你的地址>/arknights-wallpaper.webp` 返回 `200`，`content-type: image/webp`（由插件自身提供，不依赖前端产物）；
   - 页面刷新后 body 背景是壁纸，代码块与终端表面变毛玻璃；
   - 浏览器 head 中存在 `style[data-plugin-css="@deepseek-ai/dsh-client-ui-arknights-background/arknights.module.css"]`。

> 为什么必须重启：浏览器名册（`window.__DSH_BOOT__`）与组合层都在 `dsh web` **启动时**生成；profile 的补丁层虽是热重载的，但**新增一个包/一行**仍以进程启动为准。

## 方式二：在 DSH 源码 checkout（deepseek-harness-master）中使用

1. 把包目录放到 `packages/client/ui-arknights-background/`。壁纸**不用**再放进 `apps/web/public/`——插件自己提供。
2. 建立 workspace 链接：`pnpm install`。
3. 在 `packages/bundle/web-app/cordis.patch.yml` 的浏览器名册里加一行：

   ```yaml
   - id: ui-arknights-background
     name: '@deepseek-ai/dsh-client-ui-arknights-background'
   ```

   （若改用 `dsh plugin --profile web add` 安装，包内自带的 `cordis.patch.yml` 会自动插入这一行，无需手改；两者取其一即可。）
4. 重建插件产物：

   ```bash
   pnpm --filter @deepseek-ai/dsh-client-ui-arknights-background exec tsc -b
   pnpm --filter @deepseek-ai/dsh-client-ui-arknights-background run bundle
   ```
5. 重启 `dsh web`，刷新浏览器。

## 移除插件

- 安装版：`dsh plugin --profile web remove @deepseek-ai/dsh-client-ui-arknights-background`，然后重启；壁纸路由随该行一起卸载。
- 源码版：删除组合中的 `ui-arknights-background` 行（或改为 `disabled: true`），重启服务即可。

## 自定义

- 渐变颜色与极光参数在 `src/client/arknights.module.css` 顶部，改完执行 `pnpm --filter @deepseek-ai/dsh-client-ui-arknights-background run bundle` 重新构建。
- 更换壁纸：直接替换包根目录的 `arknights-wallpaper.webp`（CSS 中的路径不用改，路由按固定路径读取该文件）；分发给别人时重新 `pnpm pack`。
