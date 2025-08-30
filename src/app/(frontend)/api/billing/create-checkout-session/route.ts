import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil', // Match your webhook API version
})

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config })
    const { plan } = await req.json()

    console.log('Creating Stripe checkout session for plan:', plan)

    // Validate plan
    const validPlans = ['starter', 'proFit', 'maxFlex']
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get the logged-in user
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User creating checkout:', user.id, user.email)

    // Map plans to price IDs
    const planToPriceId: Record<string, string> = {
      starter: process.env.STARTER_PRICE_ID!,
      proFit: process.env.PROFIT_PRICE_ID!,
      maxFlex: process.env.MAXFLEX_PRICE_ID!,
    }

    const priceId = planToPriceId[plan]
    if (!priceId) {
      console.error('Price ID not found for plan:', plan)
      console.error('Available price IDs:', {
        starter: process.env.STARTER_PRICE_ID,
        proFit: process.env.PROFIT_PRICE_ID,
        maxFlex: process.env.MAXFLEX_PRICE_ID,
      })
      return NextResponse.json({ error: 'Price ID not found for plan' }, { status: 400 })
    }

    console.log('Using price ID:', priceId)

    // Create checkout session with SUBSCRIPTION mode
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // Changed from 'payment' to 'subscription'
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=1`,
      client_reference_id: user.id, // IMPORTANT: This links the session to the user
      metadata: {
        plan: plan,
        userId: user.id, // Additional backup
      },
      customer_email: user.email,
      billing_address_collection: 'auto',
      // For subscriptions, you might want to allow promotional codes
      allow_promotion_codes: true,
    })

    console.log('Stripe session created successfully:', {
      sessionId: session.id,
      url: session.url,
      clientReferenceId: user.id,
      plan: plan,
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Stripe checkout creation error:', error)

    // Return more specific error information
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: `Stripe error: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
