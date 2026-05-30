import { Package } from '@/app/lib/packages'
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
  let { packageId, amount } = await req.json()
  let priceId: string
  const p:PackageType = packageId.trim().toLowerCase()

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

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded_page',
    line_items: [
      {
        price: priceId,
        quantity: amount,
      },
    ],
    mode: 'payment',
    return_url: `${DOMAIN}?payment_success=true&session_id={CHECKOUT_SESSION_ID}&package=${packageId}`,
  })
  return NextResponse.json({ clientSecret: session.client_secret })
}
