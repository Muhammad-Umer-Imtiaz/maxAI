// lib/hasAccess.ts

export function hasAccess(plan: string, path: string): boolean {
  const accessMap: Record<string, string[]> = {
    free: [
      '/dashboard',
      '/dashboard/ai-assistant',
      '/dashboard/plan-summary',
      '/dashboard/settings',
    ],
    starter: [
      '/dashboard',
      '/dashboard/ai-assistant',
      '/dashboard/plan-summary',
      '/dashboard/settings',
    ],
    proFit: [
      '/dashboard',
      '/dashboard/ai-assistant',
      '/dashboard/plan-summary',
      '/dashboard/custom-plans',
      '/dashboard/call-history',
      '/dashboard/settings',
    ],
    maxFlex: [
      '/dashboard',
      '/dashboard/ai-assistant',
      '/dashboard/plan-summary',
      '/dashboard/custom-plans',
      '/dashboard/call-history',
      '/dashboard/updates',
      '/dashboard/settings',
    ],
  }

  return accessMap[plan]?.includes(path) ?? false
}
