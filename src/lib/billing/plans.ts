import type { AppPlan } from '@/types/app'

export type { AppPlan }

export const PLAN_TO_ENV_PRICE_ID: Record<Exclude<AppPlan, 'free'>, string | undefined> = {
  starter: process.env.STARTER_PRICE_ID,
  proFit: process.env.PROFIT_PRICE_ID,
  maxFlex: process.env.MAXFLEX_PRICE_ID,
}

export function getPriceIdForPlan(plan: AppPlan): string {
  if (plan === 'free') throw new Error('Free plan has no Stripe price')
  const priceId = PLAN_TO_ENV_PRICE_ID[plan]
  if (!priceId) throw new Error(`Missing env price id for plan: ${plan}`)
  return priceId
}

export function priceIdToPlan(priceId: string): AppPlan | null {
  if (priceId === PLAN_TO_ENV_PRICE_ID.starter) return 'starter'
  if (priceId === PLAN_TO_ENV_PRICE_ID.proFit) return 'proFit'
  if (priceId === PLAN_TO_ENV_PRICE_ID.maxFlex) return 'maxFlex'
  return null
}
