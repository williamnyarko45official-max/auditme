import { supabase } from './supabase'

export async function getUserSubscription(userId: string) {
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data
}

export function isPro(subscription: any) {
  if (!subscription) return false
  if (subscription.status !== 'active') return false
  if (!['pro', 'team'].includes(subscription.plan)) return false
  if (new Date(subscription.current_period_end) < new Date()) return false
  return true
}

export function isTeam(subscription: any) {
  if (!subscription) return false
  if (subscription.status !== 'active') return false
  if (subscription.plan !== 'team') return false
  return true
}

export function canAudit(subscription: any): { allowed: boolean; reason?: string } {
  if (isPro(subscription)) return { allowed: true }
  
  // Free tier — check monthly count
  if (!subscription) {
    return { allowed: true } // first audit always allowed, we'll create the record
  }

  const now = new Date()
  const resetDate = new Date(subscription.audit_count_reset)
  const sameMonth = now.getMonth() === resetDate.getMonth() && now.getFullYear() === resetDate.getFullYear()
  const count = sameMonth ? (subscription.audit_count || 0) : 0

  if (count >= 3) {
    return { allowed: false, reason: 'Free tier limit reached. You have used 3/3 audits this month.' }
  }

  return { allowed: true }
}

export async function incrementAuditCount(userId: string, subscription: any) {
  if (isPro(subscription)) return // don't count for pro users

  const now = new Date()
  const resetDate = subscription ? new Date(subscription.audit_count_reset) : null
  const sameMonth = resetDate && now.getMonth() === resetDate.getMonth() && now.getFullYear() === resetDate.getFullYear()
  const newCount = sameMonth ? (subscription?.audit_count || 0) + 1 : 1

  await supabase.from('subscriptions').upsert({
    user_id: userId,
    plan: 'free',
    status: 'active',
    audit_count: newCount,
    audit_count_reset: date_trunc_month(now),
    current_period_end: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
    updated_at: now.toISOString(),
  }, { onConflict: 'user_id' })
}

function date_trunc_month(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
}