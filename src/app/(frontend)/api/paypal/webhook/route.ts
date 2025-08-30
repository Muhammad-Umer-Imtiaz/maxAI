import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config })
    const body = await req.text()
    const event = JSON.parse(body)

    console.log('PayPal webhook received:', event.event_type)

    // Handle different PayPal subscription webhook events
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(event, payload)
        break

      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(event, payload)
        break

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionCancelled(event, payload)
        break

      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        await handlePaymentFailed(event, payload)
        break

      default:
        console.log('Unhandled PayPal webhook event:', event.event_type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 })
  }
}

async function handleSubscriptionActivated(event: any, payload: any) {
  try {
    const resource = event.resource
    const subscriptionId = resource.id
    const customId = resource.custom_id

    console.log('Subscription activated:', subscriptionId)

    if (!customId) {
      console.error('No custom_id found in subscription')
      return
    }

    const [userId, plan] = customId.split('_')
    if (!userId || !plan) {
      console.error('Invalid custom_id format:', customId)
      return
    }

    // Initial subscription activation - add AI calls
    await addAICallsForPlan(userId, plan, payload, subscriptionId)
  } catch (error) {
    console.error('Error handling subscription activated:', error)
  }
}

async function handlePaymentCompleted(event: any, payload: any) {
  try {
    const resource = event.resource
    const billingAgreementId = resource.billing_agreement_id

    console.log('Recurring payment completed:', resource.id)

    if (!billingAgreementId) {
      console.log('No billing agreement ID - skipping')
      return
    }

    // Find user by PayPal subscription ID
    const user = await payload.find({
      collection: 'users',
      where: {
        paypalSubscriptionId: {
          equals: billingAgreementId,
        },
      },
    })

    if (user.docs.length > 0) {
      const userData = user.docs[0]
      const plan = userData.plan

      if (plan && plan !== 'free') {
        await addAICallsForPlan(userData.id, plan, payload, billingAgreementId)
      }
    }
  } catch (error) {
    console.error('Error handling payment completed:', error)
  }
}

async function handleSubscriptionCancelled(event: any, payload: any) {
  try {
    const resource = event.resource
    const subscriptionId = resource.id

    console.log('Subscription cancelled:', subscriptionId)

    // Find user and update their plan to free
    const user = await payload.find({
      collection: 'users',
      where: {
        paypalSubscriptionId: {
          equals: subscriptionId,
        },
      },
    })

    if (user.docs.length > 0) {
      const userData = user.docs[0]

      await payload.update({
        collection: 'users',
        id: userData.id,
        data: {
          plan: 'free',
          paypalSubscriptionId: null,
          // Don't remove existing AI calls, just change plan
        },
      })

      console.log(`Updated user ${userData.id} to free plan after subscription cancellation`)
    }
  } catch (error) {
    console.error('Error handling subscription cancelled:', error)
  }
}

async function handlePaymentFailed(event: any, payload: any) {
  try {
    const resource = event.resource
    console.log('Payment failed:', resource.id)
    // Could send notification email or take other action
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function addAICallsForPlan(
  userId: string,
  plan: string,
  payload: any,
  subscriptionId?: string,
) {
  const planCallsMap: Record<string, number> = {
    starter: 5,
    proFit: 20,
    maxFlex: 999999,
  }

  const callsToAdd = planCallsMap[plan]
  if (!callsToAdd) {
    console.error('Invalid plan:', plan)
    return
  }

  const user = await payload.findByID({
    collection: 'users',
    id: userId,
  })

  if (!user) {
    console.error('User not found:', userId)
    return
  }

  await payload.update({
    collection: 'users',
    id: userId,
    data: {
      maxAiCalls: (user.maxAiCalls || 0) + callsToAdd,
      plan: plan,
      paypalSubscriptionId: subscriptionId,
    },
  })

  console.log(`Updated user ${userId} with ${callsToAdd} AI calls for ${plan} plan`)
}
