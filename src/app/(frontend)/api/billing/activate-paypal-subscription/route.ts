import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { getSubscription } from '@/lib/paypal'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config })
    const { subscriptionId } = await req.json()

    console.log('Activating PayPal subscription:', subscriptionId)

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 })
    }

    // Get the logged-in user
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get subscription details using REST API
    const subscription = await getSubscription(subscriptionId)

    console.log('PayPal subscription details:', JSON.stringify(subscription, null, 2))

    if (subscription.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Subscription not active. Status: ${subscription.status}` },
        { status: 400 },
      )
    }

    // Extract user ID and plan from custom_id
    const customId = subscription.custom_id
    if (!customId) {
      console.error('No custom_id found in subscription')
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
    }

    const [userId, plan, interval] = customId.split('_')
    if (!userId || !plan) {
      console.error('Invalid custom_id format:', customId)
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
    }

    // Verify this matches the logged-in user
    if (userId !== user.id) {
      console.error('User ID mismatch:', { userId, loggedInUserId: user.id })
      return NextResponse.json({ error: 'User mismatch' }, { status: 400 })
    }

    // Update user's AI calls and subscription info
    const planCallsMap: Record<string, number> = {
      starter: 5,
      proFit: 20,
      maxFlex: 999999, // Unlimited
    }

    const callsToAdd = planCallsMap[plan]
    if (!callsToAdd) {
      console.error('Invalid plan:', plan)
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Calculate next billing date
    const nextBillingTime = subscription.billing_info?.next_billing_time

    // Update user in database
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        maxAiCalls: (user.maxAiCalls || 0) + callsToAdd,
        plan: plan,
        paypalSubscriptionId: subscriptionId,
        paypalCustomerId: subscription.subscriber?.payer_id,
        currentPeriodEnd: nextBillingTime,
      },
    })

    console.log(`Updated user ${userId} with ${callsToAdd} AI calls for ${plan} plan`)

    return NextResponse.json({
      success: true,
      subscriptionId: subscriptionId,
      plan: plan,
      callsAdded: callsToAdd,
      nextBillingDate: nextBillingTime,
    })
  } catch (error) {
    console.error('PayPal subscription activation error:', error)
    return NextResponse.json(
      {
        error: `Failed to activate PayPal subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 },
    )
  }
}
