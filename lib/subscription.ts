export function getUserSubscription(_userId: string) {
  return null
}

export function isPro(_subscription: any) {
  return true
}

export function canAudit(_subscription: any) {
  return { allowed: true }
}

export async function incrementAuditCount(_userId: string, _subscription: any) {
}
