import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { stripe } from '@/lib/stripe'
import type { AppUser } from '@/types/app'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const authResult = await payload.auth({ headers: req.headers as Headers })
    const user = authResult?.user as unknown as AppUser | undefined
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!user.stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe customer' }, { status: 400 })
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url:
        process.env.STRIPE_PORTAL_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })
    return NextResponse.json({ url: session.url })
  } catch (e: unknown) {
    console.error('create-portal-session error', (e as Error)?.toString())
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
