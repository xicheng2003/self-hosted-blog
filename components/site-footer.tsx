export function SiteFooter() {
  return (
    <footer className="max-w-3xl mx-auto px-6 py-12 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 font-sans tracking-wider">
      <p>&copy; 2023-{new Date().getFullYear()} AuraDawn. All rights reserved.</p>
      <p className="mt-2 md:mt-0">至繁归于至简。</p>
    </footer>
  )
}
