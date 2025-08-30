import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const { email, plan, action = 'upgrade' } = await req.json()

    if (!email || !plan) {
      return NextResponse.json({ error: 'Email and plan are required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Find user by email
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (users.docs.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = users.docs[0]
    let newMaxCalls = user.maxAiCalls || 1

    // Calculate new maxAiCalls based on plan and action
    if (action === 'upgrade') {
      switch (plan) {
        case 'starter':
          newMaxCalls += 5
          break
        case 'proFit':
          newMaxCalls += 20
          break
        case 'maxFlex':
          newMaxCalls = -1 // Unlimited
          break
        default:
          return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
      }
    } else if (action === 'set') {
      // For initial plan setup
      switch (plan) {
        case 'free':
          newMaxCalls = 1
          break
        case 'starter':
          newMaxCalls = 5
          break
        case 'proFit':
          newMaxCalls = 20
          break
        case 'maxFlex':
          newMaxCalls = -1 // Unlimited
          break
        default:
          return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
      }
    }

    // Update user
    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        plan,
        maxAiCalls: newMaxCalls,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `Max AI calls updated to ${newMaxCalls === -1 ? 'unlimited' : newMaxCalls}`,
    })
  } catch (error) {
    console.error('Error updating max AI calls:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
