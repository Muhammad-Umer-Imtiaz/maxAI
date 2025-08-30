import { NextRequest, NextResponse } from 'next/server'
import { createPlan } from '@/lib/paypal'

export async function POST(req: NextRequest) {
  try {
    const { plan, isAnnual = false } = await req.json()

    console.log('Creating PayPal plan:', { plan, isAnnual })

    // Validate plan
    const validPlans = ['starter', 'proFit', 'maxFlex']
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Create the plan
    const planId = await createPlan(plan, isAnnual)

    console.log('PayPal plan created:', planId)

    return NextResponse.json({
      success: true,
      planId: planId,
    })
  } catch (error) {
    console.error('PayPal plan creation error:', error)
    return NextResponse.json(
      {
        error: `Failed to create PayPal plan: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 },
    )
  }
}
