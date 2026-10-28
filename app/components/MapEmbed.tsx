'use client'

import { useCookies } from './CookiesProvider'

export default function MapEmbed() {
  const { consent, resetConsent } = useCookies()

  if (consent === 'accepted') {
    return (
      <iframe
        src="https://www.google.com/maps?q=56.83416606,-5.09936123&z=15&output=embed"
        width="100%"
        height="450"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    )
  }

  return (
    <div className="h-[450px] w-full flex flex-col items-center justify-center gap-4 bg-gray-100 dark:bg-gray-900 px-6 text-center">
      <svg className="w-10 h-10 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Accept third-party cookies (Google Maps) to view the map
      </p>
      <button
        onClick={resetConsent}
        className="px-4 py-2 text-sm bg-amber-600 text-white font-medium rounded-full hover:bg-amber-700 cursor-pointer transition-colors"
      >
        Cookie settings
      </button>
    </div>
  )
}
