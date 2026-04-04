import { getLatestPublishedPosts } from "@/lib/posts"
import Link from "next/link"
import { ArrowRight, Github, Twitter, Mail, MapPin, Activity } from 'lucide-react'
import { format } from "date-fns"
import { SiteNav } from "@/components/site-nav"
import { SiteFooter } from "@/components/site-footer"
import { AboutSiteSection } from "@/components/about-site-section"

export const dynamic = "force-dynamic"

const inlineActionClass =
  "inline-flex items-center gap-2 font-sans text-sm text-gray-500 transition-colors duration-200 hover:text-black"

const inlineActionArrowClass = "transition-transform duration-200"

const siteTimeline = [
  {
    date: "2026.04",
    title: "全新设计",
    status: "现行",
    description:
      "以更克制的扁平化视觉、留白和衬线阅读排版重构本站，内容系统也转向自建。",
    stack:
      "Next.js 16 / React 19 / Tailwind CSS v4 / Prisma / PostgreSQL / NextAuth / Tiptap / S3-Compatible Storage / Vercel",
  },
  {
    date: "2025.08",
    title: "正文排版重整",
    status: "旧版",
    description:
      "引入思源宋体，重新整理字重、行高与中文正文的阅读节奏。",
    stack: "Next.js / Notion / Source Han Serif / Vercel",
  },
  {
    date: "2023.10",
    title: "结构逐步定型",
    status: "旧版",
    description:
      "补齐评论、社交与页脚等细节，早期的页面结构在这一阶段逐渐稳定。",
    stack: "Next.js / React / Notion / Comments / Vercel",
  },
  {
    date: "2023.01",
    title: "Notion 驱动时期",
    status: "旧版",
    description:
      "基于 nextjs-notion-starter-kit 起步，以 Notion 作为内容源，部署在 Vercel。",
    stack: "Next.js / React / Notion / Vercel",
    link: "https://github.com/xicheng2003/nextjs-notion-starter-kit/",
    linkLabel: "查看早期项目",
  },
] as const

export default async function Home() {
  // Fetch latest 3 posts for "Selected Writing"
  const posts = await getLatestPublishedPosts(3)

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-gray-200">

      <SiteNav animate />

      {/* ---------------- Main Content ---------------- */}
      <main className="max-w-3xl mx-auto px-6 pb-20">

        {/* 1. Hero Section */}
        <section className="mt-10 mb-18 md:mb-20">
          <div className="w-12 h-[1px] bg-gray-300 mb-8 animate-enter-up"></div> {/* Decorative line */}

          <h2 className="font-serif text-4xl md:text-5xl leading-[1.12] mb-8 font-medium text-gray-900">
            <span className="block animate-blur-in delay-100">构建代码，</span>
            <span className="block animate-blur-in delay-300">
              也记录<span className="italic font-serif text-gray-400 mr-2 hover:text-gray-600 transition-colors duration-300">生活</span>的微光。
            </span>
          </h2>

          <p className="font-serif text-[1.02rem] md:text-[1.08rem] text-gray-600 leading-8 md:leading-9 max-w-xl animate-enter-up delay-500">
            Hi，我是 <span className="text-black font-semibold border-b border-gray-300 pb-0.5">晨曦</span>。
            <br className="mb-4" />
            一名机械电子工程专业的学生，开发者，偶尔也是马拉松跑者。
            <br />记录那些严谨逻辑之外的，具体而鲜活的瞬间。
          </p>

          {/* Social Links */}
          <div className="flex gap-6 mt-8 animate-enter-up delay-700">
            <SocialLink href="https://github.com/xicheng2003" icon={<Github size={18} />} label="Github" />
            <SocialLink href="https://twitter.com" icon={<Twitter size={18} />} label="Twitter" />
            <SocialLink href="mailto:me@morlight.top" icon={<Mail size={18} />} label="Email" />
          </div>
        </section>

        {/* 2. Current Focus */}
        <section className="mb-24 animate-enter-up delay-200">
          <SectionTitle title="当前活动" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-6">
            {/* Card 1: Location */}
            <div className="p-6 bg-white border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 rounded-sm">
              <div className="flex items-center gap-2 mb-4 text-gray-400">
                <MapPin size={16} />
                <span className="text-xs uppercase tracking-widest font-sans">坐标</span>
              </div>
              <p className="font-serif text-lg md:text-[1.2rem] text-gray-800">
                中国 · 揭阳
              </p>
              <p className="text-[13px] md:text-sm text-gray-500 mt-2 font-sans">
                毕业在即
              </p>
            </div>

            {/* Card 2: Activity */}
            <a
              href="https://run.morlight.top"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-white border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 rounded-sm block"
            >
              <div className="flex items-center gap-2 mb-4 text-gray-400">
                <Activity size={16} />
                <span className="text-xs uppercase tracking-widest font-sans">近期动态</span>
              </div>
              <p className="font-serif text-lg md:text-[1.2rem] text-gray-800">
                梅州马拉松
              </p>
              <p className="text-[13px] md:text-sm text-gray-500 mt-2 font-sans flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                已完赛-半程马拉松（2&apos;03&quot;35）
              </p>
            </a>
          </div>
        </section>

        {/* 3. Selected Writing */}
        <section className="mb-14 animate-enter-up delay-300">
          <SectionTitle title="精选文章" />

          <div className="space-y-8 mt-6">
            {posts.length > 0 ? (
              posts.map(post => (
                <Link key={post.id} href={`/posts/${post.slug}`} className="block group">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <h4 className="font-serif text-lg md:text-[1.2rem] text-gray-800 group-hover:text-black transition-colors duration-300">
                      {post.title}
                    </h4>
                    <span className="font-sans text-[11px] md:text-xs text-gray-400 shrink-0 ml-4 tabular-nums group-hover:text-gray-600 transition-colors">
                      {format(post.createdAt, "yyyy-MM-dd")}
                    </span>
                  </div>
                  {post.excerpt && (
                    <p className="font-serif text-[15px] text-gray-500 leading-7 line-clamp-2 group-hover:text-gray-700 transition-colors">
                      {post.excerpt}
                    </p>
                  )}
                </Link>
              ))
            ) : (
              <p className="text-gray-400 italic font-serif">暂无文章</p>
            )}
          </div>


          <div className="mt-10">
            <Link href="/posts" className={`${inlineActionClass} group`}>
              查看所有文章
              <ArrowRight size={14} className={`${inlineActionArrowClass} group-hover:translate-x-1`} />
            </Link>
          </div>
        </section>

        <AboutSiteSection items={siteTimeline} />

      </main>

      <SiteFooter />

    </div>
  )
}

// --- Sub Components ---

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4">
      <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">{title}</h3>
      <div className="h-[1px] flex-1 bg-gray-200"></div>
    </div>
  )
}

function SocialLink({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-black transition-colors"
      aria-label={label}
    >
      {icon}
    </a>
  )
}
