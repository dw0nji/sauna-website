import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { signInAsAdmin } from '@/app/lib/firebase'
import BookingController from '@/app/components/controllers/BookingController'
import { loadController, sweepExpiredHolds } from '@/app/lib/checkoutHolds'
import { sendBookingEmails } from '@/app/lib/email'

// Stripe signature verification needs Node crypto and the unparsed body.
export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * Turns a held slot into a real booking. Safe to run twice: Stripe retries
 * failed deliveries, and an already-confirmed booking short-circuits.
 */
async function confirmBooking(bookingId: number): Promise<void> {
  const booking = await BookingController.getBookingById(bookingId)

  if (!booking) {
    console.error('No booking', bookingId, '- hold may have been swept')
    return
  }

  if (booking.status === 'confirmed') {
    console.log('Booking', bookingId, 'already confirmed, skipping')
    return
  }

  await BookingController.confirmBooking(bookingId)

  // Collapses the surrounding slots. Destructive, so it only runs once payment
  // is settled, never while a hold is merely pending.
  const controller = await loadController()
  await controller.cancelRelatedTimeSlots(
    booking.date,
    booking.time,
    booking.durationMinutes ?? 60
  )

  await sendBookingEmails({
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    date: booking.date,
    time: booking.time,
    packageName: booking.packageName ?? booking.PackageName,
  })
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  // Must be the raw body — req.json() would break the signature check.
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET)
  } catch (err) {
    console.error('Stripe signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Firestore rules reject anonymous writes, so act as the admin user.
  try {
    await signInAsAdmin()
  } catch (err) {
    console.error('Admin sign-in failed:', err)
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 })
  }

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.expired'
  ) {
    const session = event.data.object
    const bookingId = Number(session.metadata?.bookingId)

    if (!bookingId) {
      console.error('Session', session.id, 'has no bookingId in metadata')
    } else if (event.type === 'checkout.session.expired') {
      // Backstop for holds nothing else swept.
      try {
        await BookingController.releaseHold(bookingId)
      } catch (err) {
        console.error('Failed to release hold', bookingId, err)
        return NextResponse.json({ error: 'Release failed' }, { status: 500 })
      }
    } else if (session.payment_status !== 'paid') {
      console.log('Session', session.id, 'completed unpaid:', session.payment_status)
    } else {
      try {
        await confirmBooking(bookingId)
      } catch (err) {
        console.error('Failed to confirm booking', bookingId, err)
        // Non-2xx tells Stripe to retry this event.
        return NextResponse.json({ error: 'Confirmation failed' }, { status: 500 })
      }
    }
  }

  try {
    const released = await sweepExpiredHolds()
    if (released) console.log('Released', released, 'expired holds')
  } catch (err) {
    console.error('Hold sweep failed:', err)
  }

  return NextResponse.json({ received: true })
}
