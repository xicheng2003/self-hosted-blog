type ConfirmationEmailInput = {
  confirmationUrl: string
}

type NewPostEmailInput = {
  title: string
  excerpt: string
  postUrl: string
  publishedAt: string
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function emailShell(content: string, previewText: string) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(previewText)}</title>
  </head>
  <body style="margin:0;background:#f8f8f6;color:#171716;font-family:Georgia,'Songti SC',serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(previewText)}</div>
    <main style="max-width:560px;margin:0 auto;padding:56px 24px 64px;">
      <p style="margin:0 0 40px;color:#969691;font:600 11px/1.5 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;">AuraDawn · Blog</p>
      ${content}
      <p style="margin:48px 0 0;padding-top:18px;border-top:1px solid #deded9;color:#969691;font:12px/1.7 Arial,sans-serif;">记录代码、长跑与生活里那些具体而鲜活的瞬间。</p>
    </main>
  </body>
</html>`
}

export function createConfirmationEmail({ confirmationUrl }: ConfirmationEmailInput) {
  const safeUrl = escapeHtml(confirmationUrl)
  const previewText = "确认订阅 AuraDawn Blog"

  return {
    subject: previewText,
    text: `请打开下面的链接确认订阅（链接在 24 小时内有效）：\n\n${confirmationUrl}\n\n如果这不是你的操作，可以忽略这封邮件。`,
    html: emailShell(
      `<h1 style="margin:0;color:#171716;font-size:32px;font-weight:500;line-height:1.35;letter-spacing:-.03em;">确认订阅</h1>
      <p style="margin:22px 0 0;color:#696965;font-size:16px;line-height:1.9;">点击下面的按钮，完成博客邮件订阅。确认链接将在 24 小时后失效。</p>
      <p style="margin:30px 0 0;"><a href="${safeUrl}" style="display:inline-block;padding:12px 20px;border:1px solid #171716;color:#171716;font:600 14px/1 Arial,sans-serif;text-decoration:none;">确认邮箱</a></p>
      <p style="margin:28px 0 0;color:#969691;font:12px/1.8 Arial,sans-serif;word-break:break-all;">如果按钮无法打开，请复制此链接：<br><a href="${safeUrl}" style="color:#696965;">${safeUrl}</a></p>
      <p style="margin:22px 0 0;color:#969691;font:12px/1.8 Arial,sans-serif;">如果这不是你的操作，可以直接忽略这封邮件。</p>`,
      previewText,
    ),
  }
}

export function createNewPostEmail({
  title,
  excerpt,
  postUrl,
  publishedAt,
}: NewPostEmailInput) {
  const safeTitle = escapeHtml(title)
  const safeExcerpt = escapeHtml(excerpt)
  const safePostUrl = escapeHtml(postUrl)
  const previewText = excerpt || `新文章：${title}`

  return {
    subject: title,
    previewText,
    text: `${title}\n\n${excerpt ? `${excerpt}\n\n` : ""}${postUrl}\n\n发布日期：${publishedAt}\n\n取消订阅：{{{RESEND_UNSUBSCRIBE_URL}}}`,
    html: emailShell(
      `<p style="margin:0;color:#969691;font:600 11px/1.5 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;">New writing · ${escapeHtml(publishedAt)}</p>
      <h1 style="margin:18px 0 0;color:#171716;font-size:34px;font-weight:500;line-height:1.35;letter-spacing:-.035em;">${safeTitle}</h1>
      ${safeExcerpt ? `<p style="margin:22px 0 0;color:#696965;font-size:16px;line-height:1.9;">${safeExcerpt}</p>` : ""}
      <p style="margin:30px 0 0;"><a href="${safePostUrl}" style="display:inline-block;padding:12px 20px;border:1px solid #171716;color:#171716;font:600 14px/1 Arial,sans-serif;text-decoration:none;">阅读全文 →</a></p>
      <p style="margin:42px 0 0;color:#969691;font:12px/1.8 Arial,sans-serif;">不想再收到新文章提醒？<a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#696965;">取消订阅</a></p>`,
      previewText,
    ),
  }
}
