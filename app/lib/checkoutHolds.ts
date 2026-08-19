import Stripe from 'stripe'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import Booker from '../components/models/Booker'
import type { Booking, TimeSlot } from '../components/models/Booker'
import BookingController from '../components/controllers/BookingController'

/**
 * Server-only. Lives here rather than on BookingController because it needs the
 * Stripe server SDK, and BookingController is imported by client components.
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/** How long a slot stays reserved for an unpaid checkout. */
export const HOLD_MAX_AGE_MS = 5 * 60 * 1000

/**
 * Stripe's expires_at floor is 30 minutes, so the 5 minute limit is enforced by
 * expiring the session ourselves. Set as a backstop for holds we never sweep.
 */
export const STRIPE_MIN_EXPIRY_SECONDS = 30 * 60

export async function loadController(): Promise<BookingController> {
  const [timeslotsSnap, bookingsSnap] = await Promise.all([
    getDocs(collection(db, 'timeslots')),
    getDocs(collection(db, 'bookings')),
  ])

  const timeslots = timeslotsSnap.docs.map((d) => d.data() as TimeSlot)
  const bookings = bookingsSnap.docs.map((d) => d.data() as Booking)

  return new BookingController(new Booker(timeslots, bookings, []))
}

/**
 * Releases slots held by checkouts that were never paid, and kills their Stripe
 * sessions so a late payment can't arrive for a slot we've put back on sale.
 *
 * If expiring the session fails because it already completed, the customer paid
 * in time and the hold is left alone for the webhook to confirm.
 */
export async function sweepExpiredHolds(): Promise<number> {
  const expired = await BookingController.getExpiredHolds(HOLD_MAX_AGE_MS)
  let released = 0

  for (const hold of expired) {
    if (hold.sessionId) {
      try {
        await stripe.checkout.sessions.expire(hold.sessionId)
      } catch (err) {
        // Expiry is refused once a session is complete, so check before we
        // release: a paid hold belongs to the webhook, not the sweep.
        if (await isSessionPaid(hold.sessionId)) {
          console.log('Hold', hold.id, 'was paid in time, leaving for the webhook')
          continue
        }
        console.error('Could not expire session', hold.sessionId, (err as Error).message)
      }
    }

    await BookingController.releaseHold(hold.id)
    released++
  }

  return released
}

async function isSessionPaid(sessionId: string): Promise<boolean> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return session.payment_status === 'paid'
  } catch (err) {
    console.error('Could not retrieve session', sessionId, err)
    return false
  }
}
