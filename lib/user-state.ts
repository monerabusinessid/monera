import { db } from './db';

export interface UserState {
  user: {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  state: {
    onboardingCompleted?: boolean;
    documentsSubmitted?: boolean;
    documentsStatus?: string;
  };
  redirectTo: string;
}

export async function getUserState(userId: string): Promise<UserState> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      candidateProfile: true,
      recruiterProfile: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Base user info
  const userState: UserState = {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    state: {},
    redirectTo: '/',
  };

  // If not verified, redirect to verification
  if (!user.isVerified) {
    userState.redirectTo = '/auth/verify';
    return userState;
  }

  // Handle candidate flow
  if (user.role === 'CANDIDATE') {
    const onboardingCompleted = user.candidateProfile?.onboardingCompleted || false;
    userState.state.onboardingCompleted = onboardingCompleted;
    
    if (!onboardingCompleted) {
      userState.redirectTo = '/onboarding';
    } else {
      userState.redirectTo = '/talent';
    }
  }

  // Handle recruiter flow
  if (user.role === 'RECRUITER') {
    const documentsSubmitted = user.recruiterProfile?.documentsSubmitted || false;
    const documentsStatus = user.recruiterProfile?.documentsStatus || 'PENDING';
    
    userState.state.documentsSubmitted = documentsSubmitted;
    userState.state.documentsStatus = documentsStatus;
    
    if (!documentsSubmitted) {
      userState.redirectTo = '/company/documents';
    } else {
      userState.redirectTo = '/client';
    }
  }

  return userState;
}

export async function markOnboardingComplete(userId: string): Promise<void> {
  await db.candidateProfile.upsert({
    where: { userId },
    update: { onboardingCompleted: true },
    create: { userId, onboardingCompleted: true },
  });
}

export async function markDocumentsSubmitted(userId: string): Promise<void> {
  await db.recruiterProfile.upsert({
    where: { userId },
    update: { documentsSubmitted: true },
    create: { userId, documentsSubmitted: true },
  });
}