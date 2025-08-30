import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendOTP } from '@/lib/email'

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Check if user already exists and is verified
    const existingUsers = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (existingUsers.docs.length > 0 && existingUsers.docs[0].emailVerified) {
      return NextResponse.json({ error: 'Email already registered and verified' }, { status: 400 })
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete any existing OTP for this email
    const existingOTPs = await payload.find({
      collection: 'otp-verifications',
      where: { email: { equals: email } },
    })

    for (const existingOTP of existingOTPs.docs) {
      await payload.delete({
        collection: 'otp-verifications',
        id: existingOTP.id,
      })
    }

    // Create new OTP record
    await payload.create({
      collection: 'otp-verifications',
      data: {
        email,
        otp,
        verified: false,
        expiresAt: expiresAt.toISOString(),
      },
    })

    // Send OTP email
    await sendOTP(email, otp)

    return NextResponse.json({ success: true, message: 'OTP sent to your email' })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
