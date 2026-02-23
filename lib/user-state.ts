export async function getUserState(userId: string) {
  return {
    userId,
    redirectTo: '/dashboard',
    needsOnboarding: false,
    needsDocuments: false,
  }
}

export async function markOnboardingComplete(userId: string) {
  return { success: true }
}

export async function markDocumentsSubmitted(userId: string) {
  return { success: true }
}
