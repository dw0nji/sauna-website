'use client'

import Link from 'next/link'
import { useCookies } from './CookiesProvider'

export default function CookieConsent() {
  const { consent, ready, setConsent: choose } = useCookies()

  if (!ready || consent !== null) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-2xl p-5"
    >
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">We use cookies</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Essential storage keeps the site and checkout working. With your consent we also load Google Maps,
        which sets its own cookies.{' '}
        <Link href="/cookies" className="underline text-amber-600 dark:text-amber-400 hover:text-amber-800">
          Cookie Policy
        </Link>
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => choose('declined')}
          className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
        >
          Decline
        </button>
        <button
          onClick={() => choose('accepted')}
          className="px-4 py-2 text-sm bg-amber-600 text-white font-medium rounded-full hover:bg-amber-700 cursor-pointer transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
