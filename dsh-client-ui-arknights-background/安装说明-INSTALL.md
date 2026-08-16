# 明日方舟背景插件 — 安装说明

本包是 DeepSeek Harness Web 界面的背景插件：把 `明日方舟壁纸1.webp` 作为整个应用的背景，叠加渐变纱幕与缓慢流动的极光层，并让聊天区、代码块、终端等编码表面变成"毛玻璃"（半透明渐变 + 背景模糊）。

## 目录结构

```
dsh-client-ui-arknights-background/
├── package.json            # 可发布清单（npm pack / publish 就绪）
├── lib/                    # 已构建产物（Node 半端 + 浏览器 bundle）
│   ├── index.js / invariant.js
│   ├── client.js           # 浏览器 bundle（内嵌全部样式，自注入 <style>）
│   └── types/              # 类型声明
├── src/                    # 源码
├── tests/                  # 测试（断言样式契约）
├── arknights-wallpaper.webp  # 壁纸资源（随包分发）
└── README.md / README.zh.md
```

## 方式一：在 DSH 源码仓库（deepseek-harness-master）中使用（推荐）

插件已注册进 `packages/bundle/web-app` 的 Web 组合。复制到仓库后：

1. 把 `arknights-wallpaper.webp` 放入 `apps/web/public/arknights-wallpaper.webp`
   （构建时会被拷入 `dist/`，以 `/arknights-wallpaper.webp` 提供；本地可直接手动复制到 `apps/web/dist/` 立即生效）。
2. 包目录放到 `packages/client/ui-arknights-background/`，运行：

   ```bash
   pnpm install                 # 建立 workspace 链接（更新 lockfile）
   pnpm --filter @deepseek-ai/dsh-client-ui-arknights-background exec tsc -b
   pnpm --filter @deepseek-ai/dsh-client-ui-arknights-background run bundle
   ```

3. 重启 `dsh web`（如 `deepseekopen.cmd` → `pnpm dsh web`），刷新浏览器即可看到效果。

## 方式二：作为独立包发布 / 使用

```bash
npm pack        # 生成 dsh-client-ui-arknights-background-0.1.0-rc.5.tgz
```

- 在目标部署中安装该包，并在 Web profile 的 `cordis.patch.yml` 中添加一行：

  ```yaml
  - insert:
      - id: ui-arknights-background
        name: '@deepseek-ai/dsh-client-ui-arknights-background'
  ```

- 插件样式引用 `/arknights-wallpaper.webp`：请把 `arknights-wallpaper.webp` 放到前端静态目录
  （例如 `apps/web/public/`），保证该 URL 可访问；更换图片只需替换该文件。

## 移除插件

删除 `packages/bundle/web-app/cordis.patch.yml` 中的 `ui-arknights-background` 行
（或把该行改为 `disabled: true`），重启服务即可。

## 自定义

渐变颜色与极光参数都在 `src/client/arknights.module.css` 顶部，改完执行
`pnpm --filter @deepseek-ai/dsh-client-ui-arknights-background run bundle` 重新构建即可。
