# 部署博客与邮件订阅

博客页面继续在构建时读取 Markdown；Vercel 只为 `/api/subscribe` 和
`/api/subscribe-confirm` 创建独立函数。订阅者与退订状态保存在 Resend，项目不需要数据库。

## 1. 配置 Resend

1. 在 Resend 添加用于发信的域名，推荐独立子域名，例如 `updates.morlight.top`。
2. 按照后台提示添加 SPF、DKIM 记录并等待验证完成。
3. 创建一个 Segment，例如 `Blog subscribers`。
4. 创建一个公开 Topic，例如 `New posts`，用于管理用户的邮件偏好。
5. 创建 API Key，保存 `RESEND_API_KEY`、Segment ID 和 Topic ID。

Broadcast 邮件会使用 Resend 的退订占位符，因此用户可以在每封新文章邮件底部取消订阅。

## 2. 部署到 Vercel

在 Vercel 导入 GitHub 仓库，保持以下设置：

- Framework Preset：Next.js
- Install Command：`npm install`（默认即可）
- Build Command：`npm run build`
- Output Directory：留空，由 Next.js 自动管理
- 不要设置 `STATIC_EXPORT=true`

在 Project Settings → Environment Variables 添加：

| 变量 | 示例 | 环境 |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | `https://blog.auradawn.cn` | Production、Preview |
| `RESEND_API_KEY` | `re_...` | Production |
| `RESEND_FROM_EMAIL` | `AuraDawn Blog <letters@updates.morlight.top>` | Production |
| `RESEND_REPLY_TO` | `me@morlight.top` | Production |
| `RESEND_SEGMENT_ID` | `seg_...` | Production |
| `RESEND_TOPIC_ID` | `topic_...` | Production |
| `SUBSCRIBE_SECRET` | 至少 32 字节的随机字符串 | Production |

本地可以使用下面的命令生成订阅签名密钥：

```bash
openssl rand -base64 32
```

环境变量保存后重新部署。访问生产网站提交自己的邮箱，应该先收到确认邮件；点击确认后，
该邮箱才会出现在 Resend Contacts 中。

## 3. 配置 GitHub Actions 群发

在 GitHub 仓库 Settings → Secrets and variables → Actions 中配置：

Secrets：

- `RESEND_API_KEY`
- `RESEND_SEGMENT_ID`
- `RESEND_TOPIC_ID`

Variables：

- `BLOG_URL`，例如 `https://blog.auradawn.cn`
- `RESEND_FROM_EMAIL`
- `RESEND_REPLY_TO`

发文流程：

1. 将 `content/posts/<slug>.md` 的 `draft` 改为 `false` 并推送到主分支。
2. 等待 Vercel 的 Production Deployment 成功，并打开文章确认链接可访问。
3. 在 GitHub → Actions → **Send new post email** 中点击 **Run workflow**。
4. 输入 Markdown 文件名对应的 slug，例如 `third-party-delay`。

工作流会拒绝草稿和文件名/frontmatter slug 不一致的文章。每次发送前还会查找名称由
slug 与发布时间组成的 Broadcast：已经发送或正在排队时直接结束；已创建但尚未发送时继续发送，
避免普通重试造成重复群发。

本地只验证文章与邮件元数据、不实际发送：

```bash
npm run newsletter:send -- third-party-delay --dry-run
```

## 4. RSS 与完全静态导出

`/rss.xml` 在构建时生成，不需要函数或数据库。Feed 包含全部 `draft: false` 文章的正文、标签与绝对资源链接；新增文章发布后会随下一次构建自动进入 RSS。

`STATIC_EXPORT=true npm run build` 仍然可以生成完整静态页面与 RSS；根目录 `api/` 中的
Vercel Functions 不属于静态输出。如果静态文件部署在 Vercel 之外，需要把 `api/` 目录单独
部署为 Vercel Functions，并在构建博客时设置：

```bash
NEXT_PUBLIC_SUBSCRIBE_ENDPOINT="https://functions.example.com/api/subscribe" \
STATIC_EXPORT=true npm run build
```

独立函数需要允许博客域名的跨域 POST，并使用相同的 Resend 和签名环境变量。
