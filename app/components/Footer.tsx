import Link from 'next/link'
import CookieSettingsButton from './CookieSettingsButton'
import { BUSINESS } from '../lib/business'

const LINKS = [
  { label: 'The Experience', href: '/#amenities' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'Book Now', href: '/#packages' },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Cookie Policy', href: '/cookies' },
  { label: 'Booking Terms', href: '/terms' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          <div>
            <p className="text-white font-bold text-lg mb-2">{BUSINESS.tradingName}</p>
            <p className="text-sm">{BUSINESS.address}</p>
            <p className="text-sm">{BUSINESS.email} · {BUSINESS.phone}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-16">
            <nav aria-label="Site">
              <ul className="flex flex-col gap-3">
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
            <nav aria-label="Legal">
              <ul className="flex flex-col gap-3">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <CookieSettingsButton className="text-sm hover:text-white transition-colors" />
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-xs text-gray-600">
          © {new Date().getFullYear()} {BUSINESS.ownerName} trading as {BUSINESS.tradingName}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
