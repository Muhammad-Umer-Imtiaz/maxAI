import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { createPlan, createSubscription } from '@/lib/paypal'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config })
    const { plan, isAnnual = false } = await req.json()

    console.log('Creating PayPal subscription for plan:', plan, 'Annual:', isAnnual)

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

    console.log('User creating subscription:', user.id, user.email)

    // Create plan first
    const planId = await createPlan(plan, isAnnual)
    console.log('PayPal plan created:', planId)

    // Create custom ID for tracking
    const customId = `${user.id}_${plan}_${isAnnual ? 'annual' : 'monthly'}`

    // Create subscription
    const subscription = await createSubscription(planId, user, customId)
    console.log('PayPal subscription created:', subscription.id)

    // Find the approval URL
    const approvalUrl = subscription.links?.find((link: any) => link.rel === 'approve')?.href

    if (!approvalUrl) {
      throw new Error('No approval URL found in PayPal response')
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      planId: planId,
      approvalUrl: approvalUrl,
    })
  } catch (error) {
    console.error('PayPal subscription creation error:', error)
    return NextResponse.json(
      {
        error: `Failed to create PayPal subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 },
    )
  }
}
