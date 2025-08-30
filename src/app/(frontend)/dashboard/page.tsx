'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { Card, CardContent, CardHeader } from '@/app/(frontend)/components/ui/card'
import { Button } from '@/app/(frontend)/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { Calendar } from '@/components/ui/calendar'
import {
  Phone,
  Clock,
  DollarSign,
  Zap,
  Sparkles,
  BadgeDollarSign,
  ChevronRight,
} from 'lucide-react'
import type { AppUser } from '@/types/app'
import { ChartBarLabel } from '../components/dashboardChart'

type CallLog = {
  id: string
  assistantName: string
  createdAt: string
  duration: number
  status: string
  type: string
  cost: number
}

type CallHistoryResponse = {
  success: boolean
  data: CallLog[]
  pagination: { page: number; limit: number; total: number }
}

// Simple progress bar
function Progress({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0))
  return (
    <div className="h-2 w-full rounded bg-gray-800/80 overflow-hidden border border-gray-700/60">
      <div className="h-full bg-maxfit-neon-green transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}
// Create a separate component for the PayPal handling logic
function PayPalReturnHandler() {
  const searchParams = useSearchParams()
  const [paymentProcessing, setPaymentProcessing] = useState(false)

  useEffect(() => {
    const handlePayPalReturn = async () => {
      // ✅ PayPal returns with token and ba_token (billing agreement token)
      const token = searchParams.get('token')
      const baToken = searchParams.get('ba_token') // This is the subscription token
      const subscriptionId = searchParams.get('subscription_id') // Manual fallback

      // Check for PayPal subscription approval
      if ((token || baToken || subscriptionId) && !paymentProcessing) {
        setPaymentProcessing(true)

        try {
          // Use the token to get subscription details from PayPal
          const actualSubscriptionId = subscriptionId || baToken || token

          console.log('Activating PayPal subscription...', { actualSubscriptionId })

          const res = await fetch('/api/billing/activate-paypal-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ subscriptionId: actualSubscriptionId }),
          })

          const data = await res.json()

          if (res.ok) {
            console.log('PayPal subscription activated successfully:', data)
            alert(`Subscription activated! ${data.callsAdded} AI calls added to your account.`)
            // Clean up URL
            window.history.replaceState({}, '', '/dashboard')
            window.location.reload()
          } else {
            console.error('PayPal subscription activation failed:', data.error)
            alert(`Subscription activation failed: ${data.error}`)
          }
        } catch (error) {
          console.error('PayPal subscription activation error:', error)
          alert('Subscription activation failed. Please contact support.')
        } finally {
          setPaymentProcessing(false)
        }
      }
    }

    handlePayPalReturn()
  }, [searchParams, paymentProcessing])

  if (paymentProcessing) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-maxfit-darker-grey p-6 rounded-lg border border-maxfit-neon-green/20">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-maxfit-neon-green"></div>
            <p className="text-white">Processing PayPal subscription...</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// Main Dashboard Content Component
function DashboardContent() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AppUser | null>(null)
  const [calls, setCalls] = useState<CallLog[]>([])
  const [callsLoading, setCallsLoading] = useState(true)
  const [date, setDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        console.log('🔄 Loading dashboard data...')

        // Get token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('payload-token') : null
        console.log('🔑 Token available:', !!token)

        if (!token) {
          console.log('❌ No token found, redirecting to login')
          setLoading(false)
          setUser(null)
          return
        }

        // Use token-based auth to get user (consistent with call-history API)
        try {
          console.log('👤 Fetching user with token...')
          const userRes = await fetch('/api/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Keep this for any cookie fallback
          })

          console.log('👤 User API response:', userRes.status, userRes.ok)

          if (!userRes.ok) {
            console.log('❌ User fetch failed, token might be invalid')
            // Clear invalid token
            localStorage.removeItem('payload-token')
            setLoading(false)
            setUser(null)
            return
          }

          const userData = await userRes.json()
          console.log('👤 User data received:', userData?.user ? 'Found' : 'Not found')

          if (!mounted) return

          const fetchedUser = userData?.user as AppUser | undefined
          setUser(fetchedUser ?? null)
          setLoading(false)

          // Load calls separately - don't block user loading
          if (fetchedUser) {
            try {
              setCallsLoading(true)

              const normalize = (c: CallLog): CallLog => ({
                id: c.id,
                assistantName: c.assistantName,
                createdAt: c.createdAt,
                duration: Number(c.duration ?? 0),
                status: c.status,
                type: c.type,
                cost: Number(c.cost ?? 0),
              })

              const pageSize = 100
              let page = 1
              let total = 0
              let all: CallLog[] = []

              console.log('📞 Fetching call history...')

              do {
                const res = await fetch(
                  `/api/call-history?refresh=false&page=${page}&limit=${pageSize}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  },
                )

                console.log(`📞 Call history page ${page} response:`, res.status, res.ok)

                if (!res.ok) {
                  console.log('❌ Call history fetch failed:', res.status, res.statusText)
                  // Don't throw error - just break the loop
                  break
                }

                const data: CallHistoryResponse = await res.json()
                console.log('📞 Call history data:', data)

                const pageData = Array.isArray(data?.data) ? data.data.map(normalize) : []
                all = all.concat(pageData)
                total = data?.pagination?.total ?? all.length
                page += 1

                // Safety break to prevent infinite loop
                if (page > 10) {
                  console.log('⚠️ Breaking call history loop after 10 pages')
                  break
                }
              } while (all.length < total && total > 0)

              if (!mounted) return
              console.log('✅ Call history loaded:', all.length, 'calls')
              setCalls(all)
            } catch (callError) {
              console.error('❌ Error loading calls:', callError)
              setCalls([]) // Set empty array on error
            } finally {
              if (mounted) {
                setCallsLoading(false)
              }
            }
          } else {
            // No user, no calls
            setCalls([])
            setCallsLoading(false)
          }
        } catch (userError) {
          console.error('❌ Error fetching user:', userError)
          // Clear potentially invalid token
          localStorage.removeItem('payload-token')
          if (mounted) {
            setLoading(false)
            setUser(null)
            setCallsLoading(false)
          }
        }
      } catch (e) {
        console.error('❌ Dashboard load failed:', e)
        if (mounted) {
          setLoading(false)
          setCallsLoading(false)
        }
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const totals = useMemo(() => {
    const totalCalls = calls.length
    const totalMinutes = Math.round(
      calls.reduce((acc, c) => acc + (Number.isFinite(c.duration) ? c.duration / 60 : 0), 0),
    )
    const totalCost = Number(
      calls.reduce((acc, c) => acc + (Number.isFinite(c.cost) ? c.cost : 0), 0).toFixed(2),
    )
    return { totalCalls, totalMinutes, totalCost }
  }, [calls])

  const used = user?.aiCallsUsed ?? 0
  const quota = user?.maxAiCalls ?? 1
  const isUnlimited = quota === -1
  const maxVal = isUnlimited ? Math.max(used, 100) : quota

  function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = Math.max(0, Math.floor(seconds % 60))
    return `${m}m ${s}s`
  }

  function go(path: string) {
    window.location.href = path
  }

  // Full-page loader while fetching user
  if (loading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-maxfit-neon-green border-t-transparent animate-spin" />
          <div className="text-sm text-gray-400">Loading dashboard…</div>
        </div>
      </div>
    )
  }

  // If no user after loading is complete, show auth error
  if (!user) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-2xl text-white">Authentication Required</div>
          <div className="text-gray-400">Please log in to access your dashboard</div>
          <Button
            onClick={() => {
              // Clear any existing token before redirecting
              localStorage.removeItem('payload-token')
              window.location.href = '/login'
            }}
            className="btn-neon"
          >
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-8">
      {/* Header + CTAs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Overview</h1>
          <p className="text-gray-400 text-sm">Track your usage and manage your subscription.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button className="btn-neon" onClick={() => go('/dashboard/ai-assistant')}>
            <Sparkles className="w-4 h-4 mr-2" />
            Start AI Calls
          </Button>
          <Button variant="outline" className="btn-outline-neon" onClick={() => go('/#pricing')}>
            <BadgeDollarSign className="w-4 h-4 mr-2" />
            View Pricing Plans
          </Button>
        </div>
      </div>

      {/* Metrics row: Total Calls, Minutes, Cost */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-card-gradient border border-maxfit-neon-green/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-maxfit-neon-green/10">
                <Phone className="w-5 h-5 text-maxfit-neon-green" />
              </div>
              <div className="text-gray-300 text-sm">Total Calls</div>
            </div>
            <div className="text-3xl font-bold text-white mt-2">
              {callsLoading ? '—' : totals.totalCalls}
            </div>
          </CardHeader>
          <CardContent className="pt-0 text-gray-400 text-sm">All calls</CardContent>
        </Card>

        <Card className="bg-card-gradient border border-maxfit-neon-green/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-maxfit-neon-green/10">
                <Clock className="w-5 h-5 text-maxfit-neon-green" />
              </div>
              <div className="text-gray-300 text-sm">Total Minutes</div>
            </div>
            <div className="text-3xl font-bold text-white mt-2">
              {callsLoading ? '—' : totals.totalMinutes}
            </div>
          </CardHeader>
          <CardContent className="pt-0 text-gray-400 text-sm">Sum of durations</CardContent>
        </Card>

        <Card className="bg-card-gradient border border-maxfit-neon-green/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-maxfit-neon-green/10">
                <DollarSign className="w-5 h-5 text-maxfit-neon-green" />
              </div>
              <div className="text-gray-300 text-sm">Total Cost</div>
            </div>
            <div className="text-3xl font-bold text-white mt-2">
              {callsLoading ? '—' : `$${totals.totalCost.toFixed(2)}`}
            </div>
          </CardHeader>
          <CardContent className="pt-0 text-gray-400 text-sm">Estimated</CardContent>
        </Card>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 ">
        {/* AI Calls Used with progress */}
        <Card className="bg-card-gradient border border-maxfit-neon-green/40 pb-6 w-full">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-maxfit-neon-green/10">
                <Zap className="w-5 h-5 text-maxfit-neon-green" />
              </div>
              <div>
                <div className="text-gray-300 text-sm">AI Calls Used</div>
                <div className="text-xs text-gray-500">
                  Plan: <span className="text-white font-medium">{user?.plan ?? 'free'}</span>
                  {user?.currentPeriodEnd && (
                    <> • Renews {new Date(user.currentPeriodEnd).toLocaleDateString()}</>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4  space-y-3">
              {callsLoading ? (
                <div className="h-2 w-full animate-pulse bg-gray-800/80 rounded" />
              ) : (
                <>
                  <Progress value={Math.min(used, isUnlimited ? used : quota)} max={maxVal} />
                  <div className="text-xs text-gray-400">
                    {isUnlimited
                      ? `${used} used • Unlimited`
                      : `${used}/${quota} used (${Math.min(100, Math.round((used / quota) * 100))}%)`}
                  </div>
                </>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Recent Call Details */}
        <Card className="bg-card-gradient border border-maxfit-neon-green/30 w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Recent Call Details</h3>
              <Button
                variant="ghost"
                className="text-maxfit-neon-green hover:text-maxfit-neon-green/80"
                onClick={() => go('/dashboard/call-history')}
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {callsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-gray-800/40 rounded animate-pulse" />
                ))}
              </div>
            ) : calls.length === 0 ? (
              <div className="text-gray-400 text-sm">No recent calls found.</div>
            ) : (
              <div className="divide-y divide-gray-800/60">
                {calls.slice(0, 5).map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-maxfit-neon-green/10">
                        <Phone className="w-4 h-4 text-maxfit-neon-green" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{c.assistantName}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(c.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-gray-300">
                        <Clock className="inline w-4 h-4 mr-1 text-gray-400" />
                        {formatDuration(c.duration || 0)}
                      </div>
                      <div className="text-maxfit-neon-green">
                        <DollarSign className="inline w-4 h-4 mr-1" />$
                        {Number(c.cost ?? 0).toFixed(4)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 mt-6">
        <Card className="bg-card-gradient border border-maxfit-neon-green/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-maxfit-neon-green/10">
                <DollarSign className="w-5 h-5 text-maxfit-neon-green" />
              </div>
              <div className="text-gray-300 text-sm">Current Wieght</div>
            </div>
            <div className="text-3xl font-bold text-white mt-2">70 Kg</div>
          </CardHeader>
          <CardContent className="pt-0 text-gray-400 text-sm">Estimated</CardContent>
        </Card>
        <Card className="bg-card-gradient border border-maxfit-neon-green/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-maxfit-neon-green/10">
                <DollarSign className="w-5 h-5 text-maxfit-neon-green" />
              </div>
              <div className="text-gray-300 text-sm">Goal</div>
            </div>
            <div className="text-3xl font-bold text-white mt-2">65 Kg</div>
          </CardHeader>
          <CardContent className="pt-0 text-gray-400 text-sm">Estimated</CardContent>
        </Card>
        <Card className="bg-card-gradient border border-maxfit-neon-green/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-maxfit-neon-green/10">
                <DollarSign className="w-5 h-5 text-maxfit-neon-green" />
              </div>
              <div className="text-gray-300 text-sm">Height</div>
            </div>
            <div className="text-3xl font-bold text-white mt-2">6.1M</div>
          </CardHeader>
          <CardContent className="pt-0 text-gray-400 text-sm">Estimated</CardContent>
        </Card>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 w-full items-center">
        {/* Chart takes 80% on large screens */}
        <div className="lg:w-9/12 w-full">
          <ChartBarLabel />
        </div>

        {/* Calendar takes 20% on large screens */}
        <div className="lg:w-3/12 w-full">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border"
          />
        </div>
      </div>
    </div>
  )
}

// Main Dashboard Component - Only handles Suspense wrapper
export default function Dashboard() {
  return (
    <div>
      {/* Wrap the PayPal handler in Suspense */}
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-maxfit-darker-grey p-6 rounded-lg border border-maxfit-neon-green/20">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-maxfit-neon-green"></div>
                <p className="text-white">Loading...</p>
              </div>
            </div>
          </div>
        }
      >
        <PayPalReturnHandler />
      </Suspense>

      {/* Main dashboard content - no useSearchParams here */}
      <DashboardContent />
    </div>
  )
}
