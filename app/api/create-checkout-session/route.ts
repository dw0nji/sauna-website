import BookingController from '@/app/components/controllers/BookingController'
import { signInAsAdmin } from '@/app/lib/firebase'
import {
  HOLD_MAX_AGE_MS,
  STRIPE_MIN_EXPIRY_SECONDS,
  loadController,
  sweepExpiredHolds,
} from '@/app/lib/checkoutHolds'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const DOMAIN = process.env.NEXT_PUBLIC_FRONTEND_DOMAIN

const priceConfig = {
  group: process.env.GROUP_PRICE!,
  special: process.env.SPECIAL_PRICE!,
  short: process.env.SHORT_PRICE!,
  long: process.env.LONG_PRICE!,
} as const

type PackageType = keyof typeof priceConfig

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { packageId, booking, durationMinutes, packageName } = body
  let amount = body.amount
  let priceId: string
  const p:PackageType = packageId.trim().toLowerCase()

  if (!booking || !booking.date || !booking.time || !booking.customerEmail) {
    return NextResponse.json(
      { error: 'Missing booking details' },
      { status: 400 }
    )
  }

  if (amount < 6) {
    if (!(packageId as PackageType in priceConfig)) {
      return NextResponse.json(
        { error: 'Incorrect price was given' },
        { status: 400 }
      )
    }
    priceId = priceConfig[p]
    if (!priceId){
      return NextResponse.json(
        { error: 'Incorrect price was given' },
        { status: 400 }
      )
      
    }
  } else {
    priceId = priceConfig.group
    amount = 1
  }    
  await signInAsAdmin()

  // Free up any lapsed holds first, so an abandoned checkout can't block this
  // customer from a slot that is really available.
  try {
    await sweepExpiredHolds()
  } catch (err) {
    console.error('Hold sweep failed:', err)
  }

  // Reserve the slot before taking any money. If it has gone since the customer
  // loaded the page, they find out here instead of after being charged.
  const createdAt = Date.now()
  const pending = {
    ...booking,
    status: 'pending' as const,
    createdAt,
    durationMinutes,
    packageName,
  }

  try {
    const controller = await loadController()
    await controller.holdSlot(pending)
  } catch (err) {
    console.log('Could not hold slot:', (err as Error).message)
    return NextResponse.json(
      { error: 'That time slot has just been taken. Please choose another.' },
      { status: 409 }
    )
  }

  console.log('pricId', priceId, 'amount', amount, `${DOMAIN}?payment_success=true&session_id={CHECKOUT_SESSION_ID}&package=${packageId}`)

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      line_items: [
        {
          price: priceId,
          quantity: amount,
        },
      ],
      mode: 'payment',
      metadata: { bookingId: String(booking.id) },
      // Backstop only — the real 5 minute limit is enforced by sweepExpiredHolds.
      expires_at: Math.floor(createdAt / 1000) + STRIPE_MIN_EXPIRY_SECONDS,
      return_url: `${DOMAIN}?payment_success=true&session_id={CHECKOUT_SESSION_ID}&package=${packageId}`,
    })
  } catch (err) {
    // Don't leave a slot reserved for a checkout that never started.
    await BookingController.releaseHold(booking.id)
    throw err
  }

  await BookingController.setSessionId(booking.id, session.id)

  return NextResponse.json({
    clientSecret: session.client_secret,
    sessionId: session.id,
    expiresAt: createdAt + HOLD_MAX_AGE_MS,
  })
}
