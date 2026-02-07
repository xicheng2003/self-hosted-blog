-- ⚠️ 警告：此脚本将清空所有图片记录，仅在确认图片文件已永久丢失时运行。

-- 1. 清空 Asset 表 (因为文件都丢了，这些记录已经无效)
TRUNCATE TABLE "Asset" CASCADE;

-- 2. 重置文章封面图 (设为 NULL，前端会显示默认样式或无图)
UPDATE "Post" SET "coverImage" = NULL;

-- 3. 重置用户头像 (如果你的用户头像是上传的，也需要重置)
UPDATE "User" SET "image" = NULL;

-- 注意：Post 内容 (content) 中的 Markdown 图片链接无法通过简单 SQL 批量替换。
-- 建议在重新上传图片后，手动编辑文章进行替换。
