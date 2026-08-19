import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { signInAsAdmin } from '@/app/lib/firebase'
import BookingController from '@/app/components/controllers/BookingController'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * Frees a held slot the moment a customer abandons checkout, instead of waiting
 * for a sweep. The booking id comes from the session's own metadata rather than
 * the request body, so a caller can only release the hold behind a session id
 * they already hold, and only while it is still unpaid.
 */
export async function POST(req: NextRequest) {
  const { sessionId } = await req.json()

  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch (err) {
    console.error('Could not retrieve session', sessionId, (err as Error).message)
    return NextResponse.json({ error: 'Unknown session' }, { status: 404 })
  }

  // Never pull a slot out from under someone who has actually paid.
  if (session.payment_status === 'paid' || session.status === 'complete') {
    return NextResponse.json({ released: false, reason: 'paid' })
  }

  const bookingId = Number(session.metadata?.bookingId)
  if (!bookingId) {
    return NextResponse.json({ error: 'Session has no booking' }, { status: 400 })
  }

  try {
    await signInAsAdmin()

    // Kill the session too, so a half-finished payment page can't come back and
    // pay for a slot that is now on sale again.
    if (session.status === 'open') {
      try {
        await stripe.checkout.sessions.expire(sessionId)
      } catch (err) {
        console.error('Could not expire session', sessionId, (err as Error).message)
      }
    }

    // No-ops unless the booking is still pending.
    await BookingController.releaseHold(bookingId)
  } catch (err) {
    console.error('Failed to release hold', bookingId, err)
    return NextResponse.json({ error: 'Release failed' }, { status: 500 })
  }

  return NextResponse.json({ released: true })
}
