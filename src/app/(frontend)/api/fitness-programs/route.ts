import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('user')

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const programs = await payload.find({
      collection: 'fitness-programs',
      where: {
        user: {
          equals: userEmail,
        },
      },
      sort: '-createdAt',
      limit: 50,
    })

    return NextResponse.json(programs)
  } catch (error) {
    console.error('Error fetching fitness programs:', error)
    return NextResponse.json({ error: 'Failed to fetch fitness programs' }, { status: 500 })
  }
}
