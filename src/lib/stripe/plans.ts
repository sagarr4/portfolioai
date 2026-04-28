export const PLAN_LIMITS = {
  free: { portfolios: 1, label: 'Free', price: 0 },
  pro: { portfolios: 3, label: 'Pro', price: 12 },
  team: { portfolios: 999, label: 'Team', price: 49 },
}

export type Plan = 'free' | 'pro' | 'team'

export function canCreatePortfolio(plan: Plan, currentCount: number): boolean {
  // Whitelist check happens server-side via ALLOWED_EMAILS
  return currentCount < PLAN_LIMITS[plan].portfolios
}
