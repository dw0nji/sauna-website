'use client'

import { useCookies } from './CookiesProvider'

export default function CookieSettingsButton({ className = '' }: { className?: string }) {
  const { resetConsent } = useCookies()

  return (
    <button type="button" onClick={resetConsent} className={`cursor-pointer ${className}`}>
      Cookie settings
    </button>
  )
}
