# 静态优先的博客架构

## 当前边界

博客的核心是可长期保存的文章，而不是后台、计数器或上传服务。因此公开读取链路固定为：

```text
Markdown + local images
        ↓
LocalPostRepository
        ↓
PostRepository contract
        ↓
home / archive / post / sitemap / full-content RSS
        ↓
build-time static pages
```

这条链路没有运行时数据库和外部图床。只要 Git 仓库与构建平台可用，文章就能完整恢复。

## 为什么保留 Repository

页面直接读取文件很简单，但会把文件系统字段扩散到所有路由。`PostRepository` 把内容模型稳定在 `Post` 和 `PostSummary` 两个类型上。未来可新增：

- `DatabasePostRepository`：在构建阶段或 ISR 中查询数据库；
- `CmsPostRepository`：从任意 Headless CMS 拉取内容；
- `CompositePostRepository`：本地文章为主，远端内容作为补充。

切换点只有 `lib/content/repository.ts`。存储适配器负责把自身字段转换为公共类型，页面不接触 Prisma、SDK 或环境变量。

## 扩展功能的放置原则

- 评论、阅读量、订阅属于增强功能，可以作为独立 API 或客户端小岛加入；失败时不能阻止正文显示。
- 编辑后台如果重新引入，应该写入统一内容接口或提交 Markdown，不应让公开页面反向依赖后台数据库。
- 图片默认跟文章一起进入 `public/images/posts/<slug>/`。未来迁移对象存储时，由资源适配器生成 URL，正文语法保持不变。
- 草稿通过 `draft: true` 在内容层过滤，不生成路由，也不会出现在 sitemap。
- RSS 使用 `findPublishedWithContent()` 读取全部已发布文章并生成全文 Feed；草稿过滤仍由 Repository 负责，页面层与 Feed 都不能绕过该边界。

## 订阅与发布通知

订阅是独立增强层，不进入 `PostRepository`：

```text
静态首页表单 → 独立 api/ Vercel Function → 确认邮件 → Resend Contact / Segment / Topic
Markdown 发文 → Production 部署成功 → GitHub Actions 手动确认 → Resend Broadcast
```

确认链接使用服务端 HMAC 签名，因此待确认邮箱不需要数据库。群发采用稳定的
`post:<slug>:<publishedAt>` 名称检查已存在的 Broadcast，并使用 GitHub Actions concurrency
避免同一文章并行发送。即使 Resend 暂时不可用，文章页面和 RSS 仍然可以独立构建、访问。

## 与 `home_page` 合并

两个项目现在已经共享同一组设计语言：暖白/深灰背景、低对比灰阶、衬线阅读字体、无彩色装饰和相同的 `home-page.theme` 本地存储键。

建议最终以这个 Next.js 项目作为容器：

1. 将 `home_page` 的个人介绍迁到根路由 `/`；
2. 将当前博客首页迁到 `/writing`，文章归档保持 `/posts` 或统一为 `/writing/posts`；
3. 保留一份 `content/site.ts`、导航、页脚、主题控制和设计 token；
4. 为旧博客域名配置永久重定向，文章 slug 不变；
5. 合并完成前，`Home` 暂时指向独立的 `https://auradawn.cn`。

这样合并是路由与内容搬迁，不再是两套视觉和两套数据系统的重写。
