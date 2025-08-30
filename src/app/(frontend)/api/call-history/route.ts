import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

interface VapiCallLog {
  id: string
  orgId: string
  createdAt: string
  updatedAt: string
  type: string
  status: string
  endedAt?: string
  startedAt?: string
  cost?: number
  costBreakdown?: {
    total: number
    transport?: number
    stt?: number
    llm?: number
    tts?: number
    vapi?: number
  }
  assistant?: {
    name?: string
    metadata?: any
    [key: string]: any
  }
  assistantId?: string
  assistantOverrides?: {
    variableValues?: {
      email?: string
      name?: string
      firstName?: string
      lastName?: string
      [key: string]: any
    }
    metadata?: any
    [key: string]: any
  }
  metadata?: {
    userEmail?: string
    [key: string]: any
  }
  artifact?: {
    transcript?: string
    messages?: any[]
  }
  analysis?: {
    summary?: string
    structuredData?: any
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== CALL HISTORY API START ===')

    // Check for Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]

    // Initialize Payload
    const payloadInstance = await getPayload({ config })

    // Authenticate the request using Payload 3.5's new API
    let user: any
    try {
      const headers = new Headers()
      headers.set('authorization', `Bearer ${token}`)
      const authResult = await payloadInstance.auth({
        headers,
      })

      user = authResult.user

      if (!user) {
        return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
      }
    } catch (authError: unknown) {
      console.error('Authentication failed:', authError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userEmail = user.email
    console.log('✅ User authenticated. Email:', userEmail)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Use server-side VAPI API key (more secure)
    const vapiApiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY_PRIVATE
    if (!vapiApiKey) {
      console.error('VAPI_API_KEY not found in environment variables')
      return NextResponse.json({ error: 'Vapi API key not configured' }, { status: 500 })
    }

    const endpoint = 'https://api.vapi.ai/call'

    console.log('Calling Vapi endpoint:', endpoint)

    try {
      const vapiResponse = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('Vapi response status:', vapiResponse.status)

      if (!vapiResponse.ok) {
        const errorText = await vapiResponse.text()
        console.error('Vapi API error:', vapiResponse.status, errorText)

        return NextResponse.json(
          {
            error: 'Vapi API error',
            details: `Status: ${vapiResponse.status}, Response: ${errorText}`,
            endpoint: endpoint,
          },
          { status: vapiResponse.status },
        )
      }

      // Parsing the response - it should be an array directly
      const vapiData: VapiCallLog[] = await vapiResponse.json()
      console.log('✅ Vapi data received, total count:', vapiData.length)

      // Filter calls by user email - UPDATED FILTERING LOGIC
      console.log(`\n=== FILTERING CALLS FOR USER: ${userEmail} ===`)
      const userCalls = vapiData.filter((call, index) => {
        // Check if the email in assistantOverrides.variableValues.email matches
        const callUserEmail = call.assistantOverrides?.variableValues?.email

        if (callUserEmail === userEmail) {
          console.log(`✅ Call ${index + 1} (${call.id}) matches user ${userEmail}`)
          return true
        } else {
          console.log(
            `❌ Call ${index + 1} (${call.id}) - email: ${callUserEmail} (doesn't match ${userEmail})`,
          )
          return false
        }
      })

      console.log(
        `\n✅ User calls after filtering: ${userCalls.length} out of ${vapiData.length} total calls`,
      )

      // Handle pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedData = userCalls.slice(startIndex, endIndex)

      // Format the logs according to your needs
      const formattedLogs = paginatedData.map((log: VapiCallLog) => {
        // Calculate duration if not provided
        let duration = 0
        if (log.startedAt && log.endedAt) {
          const start = new Date(log.startedAt).getTime()
          const end = new Date(log.endedAt).getTime()
          duration = Math.floor((end - start) / 1000) // in seconds
        }

        return {
          id: log.id,
          assistantName: log.assistant?.name || 'MaxFit AI Assistant',
          createdAt: log.createdAt,
          startedAt: log.startedAt,
          endedAt: log.endedAt,
          duration,
          status: log.status,
          type: log.type,
          cost: log.cost || 0,
          costBreakdown: log.costBreakdown,
          transcript: log.artifact?.transcript || '',
          summary: log.analysis?.summary || '',
          orgId: log.orgId,
          assistantId: log.assistantId,
        }
      })

      console.log(`✅ Returning ${formattedLogs.length} formatted calls to user`)
      console.log('=== CALL HISTORY API END ===\n')

      return NextResponse.json({
        success: true,
        data: formattedLogs,
        pagination: {
          page,
          limit,
          total: userCalls.length,
          totalPages: Math.ceil(userCalls.length / limit),
        },
        debug: {
          userEmail: userEmail,
          totalCallsFromVapi: vapiData.length,
          userCallsAfterFilter: userCalls.length,
          endpoint: endpoint,
        },
      })
    } catch (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json(
        {
          error: 'Network error calling Vapi API',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
          endpoint: endpoint,
        },
        { status: 500 },
      )
    }
  } catch (error: unknown) {
    console.error('Error fetching call history:', error)
    return NextResponse.json({ error: 'Failed to fetch call history' }, { status: 500 })
  }
}
