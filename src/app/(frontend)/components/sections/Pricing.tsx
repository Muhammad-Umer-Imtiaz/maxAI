'use client'

import { Check, Zap, Crown, Infinity } from 'lucide-react'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Card, CardContent, CardHeader } from '@/app/(frontend)/components/ui/card'
import { useEffect, useState } from 'react'
import { PaymentProviderModal } from '@/app/(frontend)/components/ui/payment-provider-modal'

type AppPlan = 'free' | 'starter' | 'proFit' | 'maxFlex'

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<AppPlan | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  // Payment provider modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{
    key: Exclude<AppPlan, 'free'>
    name: string
  } | null>(null)

  // Fetch the logged-in user's current plan from Payload
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json().catch(() => null)
        const plan = data?.user?.plan as AppPlan | undefined
        if (mounted && plan) setCurrentPlan(plan)
      } catch {
        // ignore; not logged in or endpoint not available
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Handle plan selection - open payment provider modal
  function handlePlanSelection(plan: Exclude<AppPlan, 'free'>, planName: string) {
    setSelectedPlan({ key: plan, name: planName })
    setShowPaymentModal(true)
  }

  // Stripe checkout
  async function startStripeCheckout(plan: Exclude<AppPlan, 'free'>) {
    try {
      setLoadingPlan(plan)
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Checkout init failed')
      window.location.href = data.url
    } catch (e) {
      console.error(e)
      alert('Unable to start checkout. Please try again.')
    } finally {
      setLoadingPlan(null)
      setShowPaymentModal(false)
    }
  }

  // PayPal checkout
  async function startPayPalCheckout(plan: Exclude<AppPlan, 'free'>) {
    try {
      setLoadingPlan(plan)

      // Create PayPal subscription using new API
      const res = await fetch('/api/paypal/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan, isAnnual }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'PayPal subscription creation failed')

      console.log('PayPal subscription created:', data)

      // Redirect to PayPal for approval
      window.location.href = data.approvalUrl
    } catch (e) {
      console.error('PayPal checkout error:', e)
      alert(`Unable to start PayPal checkout: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoadingPlan(null)
      setShowPaymentModal(false)
    }
  }

  const plans = [
    {
      key: 'free' as AppPlan,
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      icon: Zap,
      description: 'Perfect for trying out MAXFITAI',
      badge: '',
      features: [
        '1 AI call (one-time only)',
        'Basic platform access',
        'Upgrade prompts after usage',
        'Community support',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      key: 'starter' as AppPlan,
      name: 'Starter',
      price: { monthly: 9.99, annual: 99.99 },
      icon: Zap,
      description: 'Great for fitness beginners',
      badge: '',
      features: [
        '5 AI Calls per month',
        'Workout summaries',
        'Meal summaries',
        'Basic plan generation',
        'Email support',
      ],
      cta: 'Choose Starter',
      popular: false,
    },
    {
      key: 'proFit' as AppPlan,
      name: 'Pro Fit',
      price: { monthly: 19.99, annual: 199.99 },
      icon: Crown,
      description: 'Most popular for serious fitness enthusiasts',
      badge: 'Most Popular',
      features: [
        '20 AI Calls per month',
        'Advanced workout plan generator',
        'Meal plan generator with customization',
        'Call history tracking',
        'Progress analytics',
        'Priority email support',
      ],
      cta: 'Choose Pro Fit',
      popular: true,
    },
    {
      key: 'maxFlex' as AppPlan,
      name: 'Max Flex',
      price: { monthly: 39.99, annual: 399.99 },
      icon: Infinity,
      description: 'Ultimate package for fitness professionals',
      badge: '',
      features: [
        'Unlimited AI Calls',
        'All Pro Fit features',
        'Advanced analytics dashboard',
        'Priority support',
        'Custom integrations',
        'White-label options',
      ],
      cta: 'Choose Max Flex',
      popular: false,
    },
  ]

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`
  }

  const getAnnualSavings = (plan: (typeof plans)[0]) => {
    if (plan.price.monthly === 0 || plan.price.annual === 0) return null
    const annualSavings = plan.price.monthly * 12 - plan.price.annual
    return annualSavings > 0 ? annualSavings : null
  }

  return (
    <section id="pricing" className="py-20 bg-maxfit-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Choose Your <span className="text-maxfit-neon-green text-glow">Fitness Plan</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Start free and upgrade anytime. All plans include our core AI features.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-maxfit-darker-grey rounded-full p-2 mb-8 border border-maxfit-neon-green/20">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                !isAnnual ? 'bg-maxfit-neon-green text-black' : 'text-gray-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                isAnnual ? 'bg-maxfit-neon-green text-black' : 'text-gray-300 hover:text-white'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                Save up to 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const savings = getAnnualSavings(plan)
            const currentPrice = isAnnual ? plan.price.annual : plan.price.monthly
            const IconComponent = plan.icon
            const isCurrentPlan = currentPlan === plan.key
            const isLoading = loadingPlan === plan.key

            return (
              <Card
                key={plan.key}
                className={`relative glass-card hover-lift border-0 h-full flex flex-col ${
                  plan.popular
                    ? 'ring-2 ring-maxfit-neon-green shadow-lg shadow-maxfit-neon-green/25 scale-105'
                    : ''
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-4 pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-maxfit-neon-green/20 rounded-full flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-maxfit-neon-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </CardHeader>

                <CardContent className="pt-0 flex-1 flex flex-col">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-white mb-1">
                      {formatPrice(currentPrice)}
                      {currentPrice > 0 && (
                        <span className="text-lg font-normal text-gray-400">
                          /{isAnnual ? 'year' : 'month'}
                        </span>
                      )}
                    </div>
                    {isAnnual && savings && (
                      <p className="text-maxfit-neon-green text-sm">
                        Save ${savings.toFixed(2)} per year
                      </p>
                    )}
                  </div>

                  {/* Features list with fixed height */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <Check className="w-5 h-5 text-maxfit-neon-green mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Button at bottom */}
                  <div className="mt-auto">
                    <Button
                      onClick={() => {
                        if (plan.key === 'free') {
                          window.location.href = '/signup'
                        } else {
                          handlePlanSelection(plan.key as Exclude<AppPlan, 'free'>, plan.name)
                        }
                      }}
                      disabled={isCurrentPlan || isLoading}
                      className={`w-full h-12 font-semibold transition-all ${
                        plan.popular
                          ? 'btn-neon hover:shadow-lg hover:shadow-maxfit-neon-green/25'
                          : 'bg-maxfit-darker-grey hover:bg-maxfit-medium-grey text-white border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/50'
                      }`}
                    >
                      {isLoading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : plan.cta}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Payment Provider Modal */}
      <PaymentProviderModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false)
          setSelectedPlan(null)
          setLoadingPlan(null)
        }}
        plan={selectedPlan?.key || 'starter'}
        planName={selectedPlan?.name || ''}
        onStripeSelect={() => {
          if (selectedPlan) {
            startStripeCheckout(selectedPlan.key)
          }
        }}
        onPayPalSelect={() => {
          if (selectedPlan) {
            startPayPalCheckout(selectedPlan.key)
          }
        }}
        isLoading={!!loadingPlan}
      />
    </section>
  )
}

export default Pricing
