# 博客性能优化技术文档

**日期**: 2026-01-10  
**作者**: GitHub Copilot  
**状态**: 已实施

## 1. 问题背景

用户反馈在生产环境部署后，访问具体的博客文章详情页 (`/posts/[slug]`) 速度较慢，即使在使用了加载骨架屏的情况下，首次加载（TTFB）依然由于服务器端处理时间过长而体验不佳。

### 根本原因分析
原有的实现采用 **全动态渲染 (Dynamic Rendering)** 模式：
1.  **数据库瓶颈**: 每次请求都需要实时连接数据库查询文章数据 (`prisma.post.findUnique`)。
2.  **计算瓶颈**: 每次请求都需要实时解析 Markdown 内容 (`ReactMarkdown`)，对于长文章消耗 CPU 资源较多。
3.  **鉴权阻塞**: `auth()` 会话检查在所有请求中无差别运行，而鉴权操作通常依赖 Cookie 解析，这使得页面默认变为动态渲染，无法被 CDN 或 Next.js 静态缓存。

---

## 2. 实施的优化方案

### 2.1 启用静态生成 (SSG) 与增量更新 (ISR)

**文件**: `app/posts/[slug]/page.tsx`

我们引入了 Next.js 的静态生成机制，将文章详情页从 "每次访问生成" 改为 "构建时生成"。

#### 代码变更详情：

1.  **添加 `generateStaticParams`**:
    在构建阶段（`npm run build`），系统会查询所有 `published: true` 的文章 slug，并提前生成对应的 HTML 文件。
    ```typescript
    export async function generateStaticParams() {
      const posts = await prisma.post.findMany({
        where: { published: true },
        select: { slug: true },
      })
    
      return posts.map((post) => ({
        slug: post.slug,
      }))
    }
    ```

2.  **配置 ISR (增量静态再生成)**:
    设置缓存有效期为 1 小时。这意味着页面生成后会作为静态文件服务，直到过期后有新请求才会后台更新。
    ```typescript
    export const revalidate = 3600 // 1 hour
    export const dynamicParams = true // 允许访问构建后新发布的文章
    ```

### 2.2 优化鉴权逻辑

**文件**: `app/posts/[slug]/page.tsx`

原逻辑对所有访问者进行 Session 检查，导致页面无法静态化。新逻辑仅对未发布（草稿）文章进行鉴权。

**变更前**:
```typescript
const session = await auth() // 阻塞性调用，即使用户只是看公开文章
// ...
if (!post.published && !session) { notFound() }
```

**变更后**:
```typescript
// 只有文章未发布时，才进行鉴权检查
if (!post.published) {
  const session = await auth()
  if (!session) {
    notFound()
  }
}
```

### 2.3 构建配置优化

**文件**: `next.config.ts`

开启了 `standalone` 模式，这将自动跟踪依赖并生成一个最小化的生产部署文件夹，显著减少 Docker 镜像体积（如果未来使用）并略微提升启动时的模块加载速度。

```typescript
const nextConfig: NextConfig = {
  output: 'standalone', 
  // ...
};
```

---

## 3. 预期效果

*   **构建时 (Build Time)**: `npm run build` 时间会略微增加，因为需要预渲染所有公开文章。
*   **运行时 (Runtime)**: 
    *   **公开文章**: 访问速度将达到毫秒级（静态 HTML 直接返回），不再等待数据库查询和 Markdown 渲染。
    *   **新文章**: 构建后新发布的文章在第一次被访问时会进行服务端生成（ISR），随后被缓存。
    *   **草稿文章**: 保持原有的鉴权保护，仅管理员可见（稍慢，属正常预期）。

## 4. 验证与维护

### 验证步骤
1.  运行 `npm run build`。确保控制台输出显示 `/posts/[slug]` 为 `● (SSG)` 或 `ISR` 标记，而不是 `λ (Server)`。
2.  运行 `npm run start`。
3.  点击任意文章，体验加载速度。

### 注意事项
*   如果发布了新文章，由于 `revalidate` 设置为 3600 秒，列表页可能需要等待一段时间或手动触发重新验证才能看到（取决于列表页的缓存策略，目前列表页也需要相应的 ISR 配置以保持一致性）。
