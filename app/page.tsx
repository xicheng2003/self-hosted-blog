import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowRight, Github, Twitter, Mail, MapPin, Activity } from 'lucide-react'
import { format } from "date-fns"

export const revalidate = 60

export default async function Home() {
  // Fetch latest 3 posts for "Selected Writing"
  const posts: { id: string; title: string; slug: string; excerpt: string | null; createdAt: Date }[] = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      createdAt: true,
    }
  })

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-gray-200">

      {/* ---------------- Navigation ---------------- */}
      <nav className="max-w-3xl mx-auto px-6 py-12 flex justify-between items-center animate-enter-up">
        <div className="flex flex-col">
          <h1 className="font-serif text-xl font-bold tracking-wide">AuraDawn</h1>
        </div>

        <div className="flex gap-6 text-sm tracking-wide text-gray-500 font-sans">
          <Link href="/" className="hover:text-black transition-colors border-b border-black text-black">首页</Link>
          <Link href="/posts" className="hover:text-black transition-colors hover:border-b hover:border-gray-300">博客</Link>
          <Link href="/admin" className="hover:text-black transition-colors hover:border-b hover:border-gray-300">管理</Link>
        </div>
      </nav>

      {/* ---------------- Main Content ---------------- */}
      <main className="max-w-3xl mx-auto px-6 pb-20">

        {/* 1. Hero Section */}
        <section className="mt-12 mb-20">
          <div className="w-12 h-[1px] bg-gray-300 mb-8 animate-enter-up"></div> {/* Decorative line */}

          <h2 className="font-serif text-5xl md:text-6xl leading-tight mb-8 font-medium text-gray-900">
            <span className="block animate-blur-in delay-100">构建代码，</span>
            <span className="block animate-blur-in delay-300">
              也记录<span className="italic font-serif text-gray-400 mr-2 hover:text-gray-600 transition-colors duration-300">生活</span>的微光。
            </span>
          </h2>

          <p className="font-serif text-lg text-gray-600 leading-relaxed max-w-xl animate-enter-up delay-500">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {/* Card 1: Location */}
            <div className="p-6 bg-white border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 rounded-sm">
              <div className="flex items-center gap-2 mb-4 text-gray-400">
                <MapPin size={16} />
                <span className="text-xs uppercase tracking-widest font-sans">坐标</span>
              </div>
              <p className="font-serif text-xl text-gray-800">
                中国 · 揭阳
              </p>
              <p className="text-sm text-gray-500 mt-2 font-sans">
                筹备新学期
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
              <p className="font-serif text-xl text-gray-800">
                梅州马拉松
              </p>
              <p className="text-sm text-gray-500 mt-2 font-sans flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                已完赛-半程马拉松（2'03"35）
              </p>
            </a>
          </div>
        </section>

        {/* 3. Selected Writing */}
        <section className="mb-20 animate-enter-up delay-300">
          <SectionTitle title="精选文章" />

          <div className="space-y-8 mt-6">
            {posts.length > 0 ? (
              posts.map(post => (
                <Link key={post.id} href={`/posts/${post.slug}`} className="block group">
                  <div className="flex items-baseline justify-between mb-1">
                    <h4 className="font-serif text-xl text-gray-800 group-hover:text-black transition-colors duration-300">
                      {post.title}
                    </h4>
                    <span className="font-sans text-xs text-gray-400 shrink-0 ml-4 tabular-nums group-hover:text-gray-600 transition-colors">
                      {format(post.createdAt, "yyyy-MM-dd")}
                    </span>
                  </div>
                  {post.excerpt && (
                    <p className="font-serif text-gray-500 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors">
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
            <Link href="/posts" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors group font-sans">
              查看所有文章
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-6 py-12 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 font-sans tracking-wider">
        <p>&copy; 2023-{new Date().getFullYear()} AuraDawn. All rights reserved.</p>
        <p className="mt-2 md:mt-0">至繁归于至简。</p>
      </footer>

    </div>
  )
}

// --- Sub Components ---

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4">
      <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-gray-400">{title}</h3>
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
