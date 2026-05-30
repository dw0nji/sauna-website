const LINKS = [
  { label: 'The Experience', href: '#amenities' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Book Now', href: '#booking' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          <div>
            <p className="text-white font-bold text-lg mb-2">Cool Coo Sauna</p>
            <p className="text-sm">Mill Cottage, Glenmallie Road, lochyside Caol, PH33 7BA</p>
            <p className="text-sm">hello@saunaco.com · +447884402926</p>
          </div>
          <nav>
            <ul className="flex flex-col sm:flex-row gap-4">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="border-t border-gray-800 pt-6 text-xs text-gray-600">
          © {new Date().getFullYear()} Sauna Co. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
