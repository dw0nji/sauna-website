import ThemeToggle from './ThemeToggle'

const NAV_LINKS = [
  { label: 'The Experience', href: '#amenities' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Book Now', href: '#booking' },
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="#" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Cool Co Sauna.
        </a>
        <div className="flex items-center gap-4">
          <ul className="hidden sm:flex gap-6 items-center">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
