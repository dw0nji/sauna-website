'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Consent = 'accepted' | 'declined'

const STORAGE_KEY = 'cookie-consent'

type CookiesContextValue = {
  consent: Consent | null
  ready: boolean
  setConsent: (value: Consent) => void
  resetConsent: () => void
}

const CookiesContext = createContext<CookiesContextValue>({
  consent: null,
  ready: false,
  setConsent: () => {},
  resetConsent: () => {},
})

export function useCookies() {
  return useContext(CookiesContext)
}

export default function CookiesProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<Consent | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'accepted' || stored === 'declined') setConsentState(stored)
    } catch {}
    setReady(true)
  }, [])

  function setConsent(value: Consent) {
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {}
    setConsentState(value)
  }

  function resetConsent() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setConsentState(null)
  }

  return (
    <CookiesContext.Provider value={{ consent, ready, setConsent, resetConsent }}>
      {children}
    </CookiesContext.Provider>
  )
}
