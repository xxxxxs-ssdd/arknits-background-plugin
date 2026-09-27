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

## 改完源码后怎么重新部署（本次修复使用的流程）

浏览器加载的是 profile 里**已构建的** `lib/client.js`，不是源码：改 `src/` 不会自动生效。

1. 改源码（主要就是 `src/client/arknights.module.css`）。
2. 重新构建客户端产物 —— 样式表由构建管线（tsdown + lightningcss）编译进 `lib/client.js`；
   工作区里可以直接运行 `node ../rebuild-client-css.mjs`（按同一管线重新编译 CSS 并更新产物），
   或者在 checkout 里执行 `pnpm --filter @deepseek-ai/dsh-client-ui-arknights-background run bundle`。
3. 把产物写进 profile 的安装目录（**这一步最容易漏**，插件行加载的是它）：

   ```powershell
   Copy-Item .\lib\client.js `
     "$env:USERPROFILE\.dsh\profiles\web\node_modules\@deepseek-ai\dsh-client-ui-arknights-background\lib\client.js" -Force
   ```

4. 刷新浏览器即可生效（客户端 bundle 每次加载都会带 `&rev=` 重新取；Node 半边未改时无需重启 `dsh web`）。

> 本次修复的三个坑（都会让壁纸完全不显示）：
> 1. **`:global(...)` 选择器在运行时被浏览器整条丢弃** —— 该语法只在打包阶段（Vite CSS Modules）被识别，而本插件的样式表是在打包阶段**之前**就编译进 `lib/client.js` 的，所以 `:global(...)` 原样到达浏览器，属于未知伪类，整条规则作废。样式表已全部改为普通选择器。
> 2. **对话列的槽键是 `main.conversation`**，原来只写了 `[data-slot="conversation"]`，于是中间整列仍是不透明的 `--dsw-alias-bg-base`；现在同时匹配字面键与 `$='.conversation'` 后缀。
> 3. **右侧栏（文件 / 代码预览 / 终端）的停靠面板带不透明底色** —— dockkit 的 `.tabHost:not(.float)` 画 `--dsw-alias-bg-base`，即"编码界面"里盖住壁纸的那一层；现在 `[data-dockkit-host='dock'] > [data-dockkit-pane]` 透明，代码预览改用聊天里同样的毛玻璃（半透明渐变 + 12px 模糊），浮动面板与对话框仍保持不透明。

修复后在右侧栏打开源码/文档预览的效果见 `docs/code-pane-over-wallpaper.png`（壁纸透出、代码块为毛玻璃、文字仍可读）。

## 移除插件

- 安装版：`dsh plugin --profile web remove @deepseek-ai/dsh-client-ui-arknights-background`，然后重启；壁纸路由随该行一起卸载。
- 源码版：删除组合中的 `ui-arknights-background` 行（或改为 `disabled: true`），重启服务即可。

## 自定义

- 渐变颜色与极光参数在 `src/client/arknights.module.css` 顶部，改完执行 `pnpm --filter @deepseek-ai/dsh-client-ui-arknights-background run bundle` 重新构建。
- 更换壁纸：直接替换包根目录的 `arknights-wallpaper.webp`（CSS 中的路径不用改，路由按固定路径读取该文件）；分发给别人时重新 `pnpm pack`。
