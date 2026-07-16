# AuraDawn Blog

一个静态优先、可替换内容源的个人博客。公开页面在构建时读取仓库内的 Markdown，图片与文章一起版本化；运行时不需要 PostgreSQL、Prisma、登录系统或对象存储。

## 日常使用

```bash
npm install
npm run dev
```

新文章放在 `content/posts/<slug>.md`，文章图片放在 `public/images/posts/<slug>/`：

```md
---
title: 一篇新文章
slug: a-new-post
date: 2026-07-15T08:00:00.000Z
updated: 2026-07-15T08:00:00.000Z
excerpt: 列表页与搜索引擎使用的摘要。
category: 随笔
tags:
  - 生活
  - 记录
cover: /images/posts/a-new-post/cover.jpg
featured: false
draft: true
---

正文从这里开始。
```

将 `draft` 改为 `false` 后，文章会自动进入首页、归档、详情页和 sitemap。发布前运行：

```bash
npm run lint
npm run typecheck
npm run build
```

首页同时提供静态 `/rss.xml` 和双重确认邮件订阅。邮件订阅使用少量 Vercel Functions，
订阅者、Topic 和退订状态由 Resend 管理，不会让文章读取链路依赖数据库。完整的域名、环境变量、
Vercel 与 GitHub Actions 配置见 [部署说明](docs/DEPLOYMENT.md)。

如需纯静态 HTML 输出：

```bash
STATIC_EXPORT=true npm run build
```

纯静态导出不包含动态订阅接口；需要将订阅函数单独部署，并通过
`NEXT_PUBLIC_SUBSCRIBE_ENDPOINT` 指向它。

## 结构

```text
content/
  posts/                       Markdown 文章与元数据
  site.ts                      站点名称、域名与公共链接
lib/content/
  types.ts                     页面依赖的稳定内容契约
  local-post-repository.ts     当前的本地 Markdown 适配器
  repository.ts                内容源装配入口
public/images/posts/           本地文章图片
app/                           只负责路由与展示
lib/email/                     确认链接、邮件模板与 Resend 适配
api/                           与静态页面解耦的 Vercel 订阅函数
.github/workflows/             手动确认后的新文章群发
```

页面只依赖 `PostRepository`，并不知道内容来自文件还是数据库。以后如果需要 CMS 或数据库，实现同一个接口并在 `lib/content/repository.ts` 切换即可，不需要重写首页、归档、文章页或 SEO。

## 旧系统迁移

现有 13 篇文章已经从旧 PostgreSQL 数据库导出，其中 4 篇公开、9 篇保留为草稿；公开文章引用的图片已经本地化。

`npm run content:export` 保留为一次性迁移工具。它只在迁移时读取 `.env` 中的旧数据库与 S3 配置，公开站点不会读取这些变量。重复执行会按数据库内容覆盖同名 Markdown，请先提交或备份手工修改。

更完整的架构边界与后续和 `home_page` 合并的路径见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)，共用的图标与交互约束见 [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)。
