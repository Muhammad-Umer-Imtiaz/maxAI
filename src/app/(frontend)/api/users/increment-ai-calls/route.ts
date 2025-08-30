import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  // Properly initialize Payload using the config
  const payload = await getPayload({ config: configPromise })

  const users = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: email,
      },
    },
    limit: 1,
  })

  if (users.docs.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const user = users.docs[0]
  const currentCalls = user.aiCallsUsed || 0

  try {
    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        aiCallsUsed: currentCalls + 1,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        email: updatedUser.email,
        aiCallsUsed: updatedUser.aiCallsUsed,
        plan: updatedUser.plan,
      },
    })
  } catch (error: unknown) {
    console.error('Error incrementing AI calls:', error)
    return NextResponse.json({ error: 'Failed to increment' }, { status: 500 })
  }
}
