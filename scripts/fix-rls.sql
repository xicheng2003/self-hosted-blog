-- Enable RLS on all tables to secure them from public API access
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Asset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SiteConfig" ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to content
CREATE POLICY "Public can view posts" ON "Post" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can view categories" ON "Category" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can view tags" ON "Tag" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can view assets" ON "Asset" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can view site config" ON "SiteConfig" FOR SELECT TO anon, authenticated USING (true);

-- Policy: Allow service_role (used by Prisma/Postgres user) full access
-- Note: The 'postgres' user typically bypasses RLS, but this ensures service_role connectivity works if used.
-- We do not explicitly grant write access to public/anon for Auth tables, ensuring they are secure.
