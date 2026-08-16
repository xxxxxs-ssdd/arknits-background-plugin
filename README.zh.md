# @deepseek-ai/dsh-client-ui-arknights-background

[English](README.md) | 中文

纯浏览器端背景插件：将明日方舟壁纸（`apps/web/public/arknights-wallpaper.webp`，由前端构建产物在 `/arknights-wallpaper.webp` 提供）绘制到 Web 界面之上。客户端包的整个效果就是一张样式表（`src/client/arknights.module.css`），在包物化时以 `<style data-plugin>` 标签注入。

样式表把壁纸绘制在 `body` 上，其下叠加两层渐变——一层纵向可读性纱幕（色标跟随画面本身的明暗：顶部深蓝灰的天空、中部较亮、底部暖色深色前景）加一层径向暗角——而 `body::before` 的极光层（两团柔和色光）在壁纸之上缓慢旋转缩放（`prefers-reduced-motion` 下禁用）。全视口的界面表面被"揭开"以露出壁纸：每个槽输出都被一层 `[data-slot="<key>"]` 锚点包裹（`display: contents`），因此 AppFrame（`#root > [data-slot="root"] > div`）变为透明，会话列根节点（`[data-slot="conversation"] > [data-phase]`）同样被揭开，输入席的底部渐隐带也被清空；侧边栏通过其 `--dsw-specific-sidebar-fill` 令牌保留半透明深色渐变。编码表面——markdown 代码围栏（`.md-code-block`）与终端/读文件/差异/搜索/网页等工具输出块（`[data-terminal]`、`[data-read]`、`[data-diff]`、`[data-search]`、`[data-web]`）——变成壁纸之上的"毛玻璃"：半透明渐变填充加 12px 背景模糊，围栏头部与内部 `pre` 改为透明，代码保持可读的同时画面透出。卡片、对话框与详情面板仍保留各自的不透明令牌背景，密集界面保持清晰。

界面选择器追踪的是槽系统 DOM 而非哈希后的类名（样式表内有说明）：每个槽输出由 `[data-slot="<key>]` 包装层锚定，AppFrame 是其 `> div`，`[data-phase]` 是会话列根节点始终携带的属性。二者均由本包测试断言。

## Model Experience

无。该插件只是浏览器端的一层绘制，不会触达任何模型请求。

#### KV Cache effect

无；本包既不组装也不发送任何提供商请求。

## Known Limitations and Deferred Work

- **结构化选择器**——透明覆盖按界面 DOM 位置匹配；若未来界面在 AppFrame 或会话根节点外加一层元素，需要同步更新选择器（测试已固定当前契约）。
- **固定图片 URL**——壁纸路径是前端产物字面量（`/arknights-wallpaper.webp`）；更换图片需替换 `apps/web/public/arknights-wallpaper.webp` 并重新构建 Web 产物。
