export async function startCheckout(plan: 'starter' | 'proFit' | 'maxFlex') {
  const res = await fetch('/api/billing/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ plan }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Checkout init failed')
  window.location.href = data.url
}

export async function openBillingPortal() {
  const res = await fetch('/api/billing/create-portal-session', {
    method: 'POST',
    credentials: 'include',
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Portal init failed')
  window.location.href = data.url
}
