import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { email, otp, userData } = await request.json()

    console.log('🔍 Verify OTP request:', { email, otp, userData })

    if (!email || !otp || !userData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find the OTP record - FIXED: use correct collection name and field name
    const otpRecords = await payload.find({
      collection: 'otp-verifications',
      where: {
        and: [
          { email: { equals: email } },
          { otp: { equals: otp } },
          { verified: { equals: false } },
          { expiresAt: { greater_than: new Date() } },
        ],
      },
    })

    if (otpRecords.docs.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })
    }

    const otpRecord = otpRecords.docs[0]

    // Check if user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: { equals: email },
      },
    })

    if (existingUsers.docs.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Create user with proper field mapping
    let user
    try {
      console.log('📝 Creating user with data:', userData)

      // Clean and validate the user data with proper types
      const cleanUserData = {
        email: email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        gender: userData.gender || 'prefer-not-to-say',
        password: userData.password,
        language: userData.language,
        plan: 'free' as const, // Use 'as const' to ensure proper type
        aiCallsUsed: 0,
        maxAiCalls: 5,
        emailVerified: true,
      }

      console.log('🧹 Clean user data:', cleanUserData)

      user = await payload.create({
        collection: 'users',
        data: cleanUserData,
      })

      console.log('✅ User created successfully:', user.id)
    } catch (createError) {
      console.error('❌ User creation error:', createError)
    }

    // Mark OTP as verified - FIXED: use correct collection name and field
    await payload.update({
      collection: 'otp-verifications',
      id: otpRecord.id,
      data: {
        verified: true,
      },
    })

    // Generate JWT token
    const token = await payload.login({
      collection: 'users',
      data: {
        email: email,
        password: userData.password,
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user?.id,
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        gender: user?.gender,
        language: user?.language,
      },
      token: token.token,
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
