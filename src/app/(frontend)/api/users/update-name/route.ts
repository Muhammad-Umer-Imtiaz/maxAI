import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName } = await req.json()

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, first name, and last name are required' },
        { status: 400 },
      )
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

    // Update user name
    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Name updated successfully',
    })
  } catch (error) {
    console.error('Error updating name:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
