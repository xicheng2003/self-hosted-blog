-- Migration script to update MinIO URLs from IP to Domain
-- Run this in your database (e.g., via Supabase SQL Editor or pgAdmin)

-- 1. Update Asset URLs
UPDATE "Asset"
SET url = REPLACE(url, 'http://64.112.40.12:9000', 'http://oss.auradawn.cn');

-- 2. Update Post Content (Markdown links)
UPDATE "Post"
SET content = REPLACE(content, 'http://64.112.40.12:9000', 'http://oss.auradawn.cn');

-- 3. Update Post Cover Images
UPDATE "Post"
SET "coverImage" = REPLACE("coverImage", 'http://64.112.40.12:9000', 'http://oss.auradawn.cn');

-- 4. Update User Avatars
UPDATE "User"
SET image = REPLACE(image, 'http://64.112.40.12:9000', 'http://oss.auradawn.cn');
