import Image from "next/image"

export function SiteFooter() {
  return (
    <footer className="max-w-3xl mx-auto px-6 py-10 md:py-12 border-t border-gray-200 text-[11px] leading-5 md:text-xs text-gray-400 font-sans">
      <div className="overflow-x-auto">
        <div className="inline-flex min-w-full items-center gap-2 whitespace-nowrap tracking-[0.08em]">
          <p className="leading-none">
            &copy; 2023-{new Date().getFullYear()} AuraDawn. All rights reserved.
          </p>
          <span className="text-gray-300">/</span>
          <p className="leading-none">至繁归于至简。</p>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <div className="inline-flex min-w-full items-center gap-4 whitespace-nowrap tracking-normal">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center leading-5 transition-colors hover:text-gray-600"
          >
            粤ICP备2026028355号
          </a>

          <a
            href="https://beian.mps.gov.cn/#/query/webSearch"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 leading-5 transition-colors hover:text-gray-600"
          >
            <Image
              src="/foot-ga.png"
              alt="公安备案图标"
              width={14}
              height={16}
              className="h-4 w-auto shrink-0"
            />
            <span>粤公网安备44178102001279号</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
