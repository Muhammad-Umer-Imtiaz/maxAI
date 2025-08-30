import paypal from '@paypal/checkout-server-sdk'

// PayPal environment setup
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID!
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not found in environment variables')
  }

  // Use sandbox for development, live for production
  return process.env.PAYPAL_ENVIRONMENT === 'production'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret)
}

// PayPal client
export function paypalClient() {
  return new paypal.core.PayPalHttpClient(environment())
}

// PayPal plan pricing (matching your Stripe plans)
export const PAYPAL_PLAN_PRICING = {
  starter: {
    monthly: 9.99,
    annual: 99.99,
  },
  proFit: {
    monthly: 19.99,
    annual: 199.99,
  },
  maxFlex: {
    monthly: 39.99,
    annual: 399.99,
  },
} as const

// Helper function to get plan price
export function getPayPalPlanPrice(plan: string, isAnnual: boolean): number {
  const prices = PAYPAL_PLAN_PRICING
  const planPrices = prices[plan as keyof typeof prices]
  if (!planPrices) throw new Error(`Invalid plan: ${plan}`)

  return isAnnual ? planPrices.annual : planPrices.monthly
}

// Get subscription interval
export function getPayPalInterval(isAnnual: boolean): string {
  return isAnnual ? 'YEAR' : 'MONTH'
}

// Get PayPal access token
export async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!
  const baseURL =
    process.env.PAYPAL_ENVIRONMENT === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

  const response = await fetch(`${baseURL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

// Create PayPal subscription plan
export async function createPlan(plan: string, isAnnual: boolean): Promise<string> {
  const accessToken = await getAccessToken()
  const price = getPayPalPlanPrice(plan, isAnnual)
  const interval = getPayPalInterval(isAnnual)
  const baseURL =
    process.env.PAYPAL_ENVIRONMENT === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

  const planName = `MAXFIT AI ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`
  const planDescription = `${planName} - ${isAnnual ? 'Annual' : 'Monthly'} Subscription`

  // First, create a product
  const productResponse = await fetch(`${baseURL}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name: `MAXFIT AI ${plan.toUpperCase()}`,
      description: `MAXFIT AI ${plan} subscription service`,
      type: 'SERVICE',
      category: 'SOFTWARE',
    }),
  })

  if (!productResponse.ok) {
    throw new Error(`Failed to create product: ${productResponse.statusText}`)
  }

  const productData = await productResponse.json()
  const productId = productData.id

  // Then, create a plan for the product
  const planResponse = await fetch(`${baseURL}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      product_id: productId,
      name: planName,
      description: planDescription,
      billing_cycles: [
        {
          frequency: {
            interval_unit: interval,
            interval_count: 1,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // Infinite cycles
          pricing_scheme: {
            fixed_price: {
              value: price.toFixed(2),
              currency_code: 'USD',
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
      taxes: {
        percentage: '0',
        inclusive: false,
      },
    }),
  })

  if (!planResponse.ok) {
    const errorText = await planResponse.text()
    throw new Error(`Failed to create plan: ${planResponse.statusText} - ${errorText}`)
  }

  const planData = await planResponse.json()
  return planData.id
}

// Create PayPal subscription
export async function createSubscription(
  planId: string,
  user: any,
  customId: string,
): Promise<any> {
  const accessToken = await getAccessToken()
  const baseURL =
    process.env.PAYPAL_ENVIRONMENT === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

  // ✅ Get dynamic URLs from environment or construct them
  const getReturnUrl = () => {
    if (process.env.PAYPAL_SUCCESS_URL) {
      return process.env.PAYPAL_SUCCESS_URL
    }

    // Fallback: construct from NEXTAUTH_URL or request
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'
    return `${baseUrl}/dashboard`
  }

  const getCancelUrl = () => {
    if (process.env.PAYPAL_CANCEL_URL) {
      return process.env.PAYPAL_CANCEL_URL
    }

    // Fallback: construct from NEXTAUTH_URL or request
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'
    return `${baseUrl}/pricing?canceled=1`
  }

  const response = await fetch(`${baseURL}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      plan_id: planId,
      start_time: new Date(Date.now() + 60000).toISOString(), // Start 1 minute from now
      quantity: '1',
      subscriber: {
        name: {
          given_name: user.firstName || 'User',
          surname: user.lastName || 'User',
        },
        email_address: user.email,
      },
      application_context: {
        brand_name: 'MAXFIT AI',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
        },
        // ✅ Use dynamic URLs
        return_url: getReturnUrl(),
        cancel_url: getCancelUrl(),
      },
      custom_id: customId,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to create subscription: ${response.statusText} - ${errorText}`)
  }

  return await response.json()
}

// Get subscription details
export async function getSubscription(subscriptionId: string): Promise<any> {
  const accessToken = await getAccessToken()
  const baseURL =
    process.env.PAYPAL_ENVIRONMENT === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

  const response = await fetch(`${baseURL}/v1/billing/subscriptions/${subscriptionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get subscription: ${response.statusText}`)
  }

  return await response.json()
}
