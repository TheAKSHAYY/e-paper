export type PublicationRole = 'owner' | 'admin' | 'editor' | 'designer' | 'reporter' | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  emailConfirmed: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  primaryLanguage: 'en' | 'hi';
  preferredPageSize: 'broadsheet' | 'tabloid' | 'berliner' | 'a3' | 'a4';
  isOnboarded: boolean;
  publicationName?: string;
  publicationTagline?: string;
  role: PublicationRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  expiresAt: number; // Unix timestamp in seconds
}

export type AuthMode = 'cloud' | 'mock' | 'unconfigured';

export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  error: string | null;
  isCloudConnected: boolean;
  authMode: AuthMode;
  configurationError: string | null;
}

export interface SignUpParams {
  fullName: string;
  email: string;
  password: string;
}

export interface SignInParams {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface OnboardingData {
  fullName: string;
  avatarUrl?: string;
  publicationName: string;
  publicationTagline?: string;
  primaryLanguage: 'en' | 'hi';
  preferredPageSize: 'broadsheet' | 'tabloid' | 'berliner' | 'a3' | 'a4';
  role?: PublicationRole;
}

export interface AuthContextType extends AuthState {
  signIn: (params: SignInParams) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    params: SignUpParams
  ) => Promise<{ success: boolean; requiresVerification: boolean; error?: string }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: (data: OnboardingData) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}
