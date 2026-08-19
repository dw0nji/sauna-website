'use client'

import { useEffect, useState } from 'react'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type Props = {
  clientSecret: string
  /** Epoch ms the slot hold lapses. */
  expiresAt: number
  onClose: () => void
  onExpire: () => void
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

export default function CheckoutModal({ clientSecret, expiresAt, onClose, onExpire }: Props) {
  const [remaining, setRemaining] = useState(() => expiresAt - Date.now())

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // Display only — the server expires the Stripe session, so a fiddled clock
  // here can't buy anyone extra time.
  useEffect(() => {
    const tick = setInterval(() => {
      const left = expiresAt - Date.now()
      setRemaining(left)
      if (left <= 0) {
        clearInterval(tick)
        onExpire()
      }
    }, 1000)
    return () => clearInterval(tick)
  }, [expiresAt, onExpire])

  const isUrgent = remaining <= 60_000

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-950">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Secure Payment</p>
            <p className="text-white font-bold text-lg leading-tight">Complete Your Booking</p>
            <p
              className={`text-xs mt-1 font-semibold tabular-nums ${
                isUrgent ? 'text-red-400' : 'text-amber-400'
              }`}
            >
              Slot held for {formatRemaining(remaining)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    </div>
  )
}
