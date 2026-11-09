import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type {
  AuthContextType,
  AuthMode,
  AuthUser,
  UserProfile,
  AuthSession,
  SignInParams,
  SignUpParams,
  OnboardingData,
} from './types';
import { supabase, isSupabaseConfigured, getSupabaseConfigStatus } from './supabaseClient';
import { publisherProfileStorage } from '../storage/PublisherProfileStorage';

const LOCAL_USERS_KEY = 'epaper_studio_local_users';
const LOCAL_SESSION_KEY = 'epaper_studio_local_session';
const PENDING_VERIFICATION_KEY = 'epaper_studio_pending_verification';

interface StoredLocalUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  avatarUrl?: string;
  emailConfirmed: boolean;
  isOnboarded: boolean;
  publicationName?: string;
  publicationTagline?: string;
  primaryLanguage: 'en' | 'hi';
  preferredPageSize: 'broadsheet' | 'tabloid' | 'berliner' | 'a3' | 'a4';
  role: 'owner' | 'admin' | 'editor' | 'designer' | 'reporter' | 'viewer';
  createdAt: string;
  updatedAt: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isProduction = import.meta.env.PROD;
  const configStatus = useMemo(() => getSupabaseConfigStatus(), []);

  // Determine active authentication mode:
  // - 'cloud': Supabase credentials are valid, client initialized
  // - 'unconfigured': In production with missing/placeholder Supabase credentials
  // - 'mock': In development mode or explicit test harness mode
  const authMode: AuthMode = useMemo(() => {
    if (isSupabaseConfigured && supabase) return 'cloud';
    if (
      typeof window !== 'undefined' &&
      (window.location.search.includes('mock=true') ||
        localStorage.getItem('epaper_studio_auth_mode') === 'mock')
    ) {
      return 'mock';
    }
    if (isProduction) return 'unconfigured';
    return 'mock';
  }, [isProduction]);

  const configurationError: string | null = useMemo(() => {
    if (authMode === 'unconfigured') {
      return (
        configStatus.errorMessage ||
        'Production cloud authentication is not configured. Missing valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      );
    }
    return null;
  }, [authMode, configStatus]);

  // -------------------------------------------------------------
  // Helper: Local Storage Users DB for Offline Development Mock Mode
  // -------------------------------------------------------------
  const getLocalUsers = useCallback((): StoredLocalUser[] => {
    if (authMode !== 'mock') return [];
    try {
      const data = localStorage.getItem(LOCAL_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }, [authMode]);

  const saveLocalUsers = useCallback(
    (users: StoredLocalUser[]) => {
      if (authMode !== 'mock') return;
      try {
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      } catch (e) {
        console.warn('[Auth] Failed to save local users', e);
      }
    },
    [authMode]
  );

  // -------------------------------------------------------------
  // 1. Session Initialization & Listener
  // -------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setIsLoading(true);

      // Branch 0: Production without Supabase configuration -> NEVER fall back to mock
      if (authMode === 'unconfigured') {
        if (isMounted) {
          setUser(null);
          setSession(null);
          setProfile(null);
          setIsLoading(false);
        }
        return;
      }

      // Branch A: Real Supabase Cloud Auth
      if (authMode === 'cloud' && supabase) {
        try {
          const {
            data: { session: sbSession },
            error: sessionError,
          } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;

          if (sbSession?.user) {
            const authUser: AuthUser = {
              id: sbSession.user.id,
              email: sbSession.user.email || '',
              fullName: sbSession.user.user_metadata?.full_name || '',
              avatarUrl: sbSession.user.user_metadata?.avatar_url,
              emailConfirmed: Boolean(sbSession.user.email_confirmed_at),
              createdAt: sbSession.user.created_at,
            };

            const userSession: AuthSession = {
              user: authUser,
              accessToken: sbSession.access_token,
              expiresAt: sbSession.expires_at || Math.floor(Date.now() / 1000) + 3600,
            };

            // Fetch profile from public.profiles
            let userProfile: UserProfile = {
              id: authUser.id,
              email: authUser.email,
              fullName: authUser.fullName,
              avatarUrl: authUser.avatarUrl,
              primaryLanguage: 'en',
              preferredPageSize: 'broadsheet',
              isOnboarded: false,
              role: 'owner',
              createdAt: authUser.createdAt,
              updatedAt: authUser.createdAt,
            };

            try {
              const { data: dbProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

              if (dbProfile) {
                userProfile = {
                  ...userProfile,
                  fullName: dbProfile.full_name || userProfile.fullName,
                  avatarUrl: dbProfile.avatar_url || userProfile.avatarUrl,
                  primaryLanguage: dbProfile.primary_language || 'en',
                  preferredPageSize: dbProfile.preferred_page_size || 'broadsheet',
                  isOnboarded: Boolean(dbProfile.is_onboarded),
                  updatedAt: dbProfile.updated_at || userProfile.updatedAt,
                };
              }
            } catch {
              // Local fallback if table is not yet reachable
            }

            if (isMounted) {
              setUser(authUser);
              setSession(userSession);
              setProfile(userProfile);
            }
          }
        } catch (e: unknown) {
          console.warn('[Auth] Supabase session retrieval notice:', e);
        } finally {
          if (isMounted) setIsLoading(false);
        }

        // Subscribe to Supabase auth events
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!isMounted) return;

            if (event === 'SIGNED_OUT' || !newSession) {
              setUser(null);
              setSession(null);
              setProfile(null);
              setIsLoading(false);
            } else if (newSession?.user) {
              const authUser: AuthUser = {
                id: newSession.user.id,
                email: newSession.user.email || '',
                fullName: newSession.user.user_metadata?.full_name || '',
                avatarUrl: newSession.user.user_metadata?.avatar_url,
                emailConfirmed: Boolean(newSession.user.email_confirmed_at),
                createdAt: newSession.user.created_at,
              };

              setUser(authUser);
              setSession({
                user: authUser,
                accessToken: newSession.access_token,
                expiresAt: newSession.expires_at || Math.floor(Date.now() / 1000) + 3600,
              });
              setIsLoading(false);
            }
          }
        );

        return () => {
          isMounted = false;
          authListener?.subscription.unsubscribe();
        };
      }

      // Branch B: Development Mock Auth Mode
      if (authMode === 'mock') {
        try {
          const rawSession = localStorage.getItem(LOCAL_SESSION_KEY);
          if (rawSession) {
            const parsed = JSON.parse(rawSession);
            const users = getLocalUsers();
            const matchedUser = users.find((u) => u.id === parsed.userId);

            if (matchedUser) {
              const authUser: AuthUser = {
                id: matchedUser.id,
                email: matchedUser.email,
                fullName: matchedUser.fullName,
                avatarUrl: matchedUser.avatarUrl,
                emailConfirmed: matchedUser.emailConfirmed,
                createdAt: matchedUser.createdAt,
              };

              const userProfile: UserProfile = {
                id: matchedUser.id,
                email: matchedUser.email,
                fullName: matchedUser.fullName,
                avatarUrl: matchedUser.avatarUrl,
                primaryLanguage: matchedUser.primaryLanguage,
                preferredPageSize: matchedUser.preferredPageSize,
                isOnboarded: matchedUser.isOnboarded,
                publicationName: matchedUser.publicationName,
                publicationTagline: matchedUser.publicationTagline,
                role: matchedUser.role,
                createdAt: matchedUser.createdAt,
                updatedAt: matchedUser.updatedAt,
              };

              if (isMounted) {
                setUser(authUser);
                setProfile(userProfile);
                setSession({
                  user: authUser,
                  accessToken: `mock-dev-token-${matchedUser.id}`,
                  expiresAt: Math.floor(Date.now() / 1000) + 86400 * 30,
                });
              }
            } else {
              localStorage.removeItem(LOCAL_SESSION_KEY);
            }
          }
        } catch (e) {
          console.warn('[Auth] Error restoring local mock session:', e);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }

      return () => {
        isMounted = false;
      };
    }

    initAuth();
  }, [authMode, getLocalUsers]);

  // Multi-tab sync for development mock session
  useEffect(() => {
    if (authMode !== 'mock') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_SESSION_KEY) {
        if (!e.newValue) {
          setUser(null);
          setSession(null);
          setProfile(null);
        } else {
          try {
            const parsed = JSON.parse(e.newValue);
            const users = getLocalUsers();
            const matchedUser = users.find((u) => u.id === parsed.userId);
            if (matchedUser) {
              const authUser: AuthUser = {
                id: matchedUser.id,
                email: matchedUser.email,
                fullName: matchedUser.fullName,
                avatarUrl: matchedUser.avatarUrl,
                emailConfirmed: matchedUser.emailConfirmed,
                createdAt: matchedUser.createdAt,
              };
              setUser(authUser);
              setProfile({
                id: matchedUser.id,
                email: matchedUser.email,
                fullName: matchedUser.fullName,
                avatarUrl: matchedUser.avatarUrl,
                primaryLanguage: matchedUser.primaryLanguage,
                preferredPageSize: matchedUser.preferredPageSize,
                isOnboarded: matchedUser.isOnboarded,
                publicationName: matchedUser.publicationName,
                publicationTagline: matchedUser.publicationTagline,
                role: matchedUser.role,
                createdAt: matchedUser.createdAt,
                updatedAt: matchedUser.updatedAt,
              });
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [authMode, getLocalUsers]);

  // -------------------------------------------------------------
  // 2. Authentication Actions
  // -------------------------------------------------------------

  const signIn = useCallback(
    async ({ email, password }: SignInParams): Promise<{ success: boolean; error?: string }> => {
      setError(null);
      const cleanEmail = email.trim().toLowerCase();

      // Guard: Unconfigured Production
      if (authMode === 'unconfigured') {
        const msg =
          configurationError ||
          'Cloud authentication is not configured in this production environment.';
        setError(msg);
        return { success: false, error: msg };
      }

      // Cloud Supabase Auth
      if (authMode === 'cloud' && supabase) {
        try {
          const { data, error: sbError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (sbError) {
            let msg = sbError.message;
            if (msg.includes('Invalid login credentials')) {
              msg = 'Incorrect email or password. Please verify your credentials.';
            } else if (msg.includes('Email not confirmed')) {
              msg = 'Please confirm your email address before signing in.';
            }
            setError(msg);
            return { success: false, error: msg };
          }

          if (data.user) {
            const authUser: AuthUser = {
              id: data.user.id,
              email: data.user.email || cleanEmail,
              fullName: data.user.user_metadata?.full_name || '',
              avatarUrl: data.user.user_metadata?.avatar_url,
              emailConfirmed: Boolean(data.user.email_confirmed_at),
              createdAt: data.user.created_at,
            };

            setUser(authUser);
            if (data.session) {
              setSession({
                user: authUser,
                accessToken: data.session.access_token,
                expiresAt: data.session.expires_at || Math.floor(Date.now() / 1000) + 3600,
              });
            }
            return { success: true };
          }
          return { success: false, error: 'Authentication service did not return user data.' };
        } catch (e: unknown) {
          const err =
            e instanceof Error
              ? e.message
              : 'Network error communicating with authentication service.';
          setError(err);
          return { success: false, error: err };
        }
      }

      // Development Mock Auth
      if (authMode === 'mock') {
        const users = getLocalUsers();
        const matched = users.find((u) => u.email.toLowerCase() === cleanEmail);

        if (!matched) {
          const msg = 'No account found with this email address. Please sign up first.';
          setError(msg);
          return { success: false, error: msg };
        }

        if (matched.passwordHash !== btoa(password)) {
          const msg = 'Incorrect password. Please try again or use password reset.';
          setError(msg);
          return { success: false, error: msg };
        }

        if (!matched.emailConfirmed) {
          const msg = 'Please confirm your email address before signing in.';
          setError(msg);
          return { success: false, error: msg };
        }

        const authUser: AuthUser = {
          id: matched.id,
          email: matched.email,
          fullName: matched.fullName,
          avatarUrl: matched.avatarUrl,
          emailConfirmed: true,
          createdAt: matched.createdAt,
        };

        const userProfile: UserProfile = {
          id: matched.id,
          email: matched.email,
          fullName: matched.fullName,
          avatarUrl: matched.avatarUrl,
          primaryLanguage: matched.primaryLanguage,
          preferredPageSize: matched.preferredPageSize,
          isOnboarded: matched.isOnboarded,
          publicationName: matched.publicationName,
          publicationTagline: matched.publicationTagline,
          role: matched.role,
          createdAt: matched.createdAt,
          updatedAt: matched.updatedAt,
        };

        setUser(authUser);
        setProfile(userProfile);
        setSession({
          user: authUser,
          accessToken: `mock-dev-token-${matched.id}`,
          expiresAt: Math.floor(Date.now() / 1000) + 86400 * 30,
        });

        localStorage.setItem(
          LOCAL_SESSION_KEY,
          JSON.stringify({ userId: matched.id, signedInAt: new Date().toISOString() })
        );

        return { success: true };
      }

      return { success: false, error: 'Authentication service unavailable.' };
    },
    [authMode, configurationError, getLocalUsers]
  );

  const signUp = useCallback(
    async ({
      fullName,
      email,
      password,
    }: SignUpParams): Promise<{
      success: boolean;
      requiresVerification: boolean;
      error?: string;
    }> => {
      setError(null);
      const cleanEmail = email.trim().toLowerCase();

      // Guard: Unconfigured Production
      if (authMode === 'unconfigured') {
        const msg =
          configurationError ||
          'Cloud registration is not configured in this production environment.';
        setError(msg);
        return { success: false, requiresVerification: false, error: msg };
      }

      // Cloud Supabase Auth
      if (authMode === 'cloud' && supabase) {
        try {
          const { data, error: sbError } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: fullName.trim(),
              },
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (sbError) {
            let msg = sbError.message;
            if (msg.includes('already registered')) {
              msg = 'An account with this email address already exists. Please sign in.';
            }
            setError(msg);
            return { success: false, requiresVerification: false, error: msg };
          }

          const requiresVerification =
            !data.session && Boolean(data.user && !data.user.email_confirmed_at);
          localStorage.setItem(PENDING_VERIFICATION_KEY, cleanEmail);

          if (data.session && data.user) {
            const authUser: AuthUser = {
              id: data.user.id,
              email: data.user.email || cleanEmail,
              fullName,
              emailConfirmed: true,
              createdAt: data.user.created_at,
            };
            setUser(authUser);
            setSession({
              user: authUser,
              accessToken: data.session.access_token,
              expiresAt: data.session.expires_at || Math.floor(Date.now() / 1000) + 3600,
            });
          }

          return { success: true, requiresVerification };
        } catch (e: unknown) {
          const err =
            e instanceof Error
              ? e.message
              : 'Network error communicating with authentication service.';
          setError(err);
          return { success: false, requiresVerification: false, error: err };
        }
      }

      // Development Mock Auth
      if (authMode === 'mock') {
        const users = getLocalUsers();
        if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
          const msg = 'An account with this email address already exists in mock store.';
          setError(msg);
          return { success: false, requiresVerification: false, error: msg };
        }

        const now = new Date().toISOString();
        const newId = `mock-usr-${Date.now()}`;
        const newUser: StoredLocalUser = {
          id: newId,
          email: cleanEmail,
          passwordHash: btoa(password),
          fullName: fullName.trim(),
          emailConfirmed: true,
          isOnboarded: false,
          primaryLanguage: 'en',
          preferredPageSize: 'broadsheet',
          role: 'owner',
          createdAt: now,
          updatedAt: now,
        };

        saveLocalUsers([...users, newUser]);

        const authUser: AuthUser = {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          emailConfirmed: true,
          createdAt: newUser.createdAt,
        };

        const userProfile: UserProfile = {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          primaryLanguage: newUser.primaryLanguage,
          preferredPageSize: newUser.preferredPageSize,
          isOnboarded: false,
          role: newUser.role,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        };

        setUser(authUser);
        setProfile(userProfile);
        setSession({
          user: authUser,
          accessToken: `mock-dev-token-${newUser.id}`,
          expiresAt: Math.floor(Date.now() / 1000) + 86400 * 30,
        });

        localStorage.setItem(
          LOCAL_SESSION_KEY,
          JSON.stringify({ userId: newUser.id, signedInAt: now })
        );

        return { success: true, requiresVerification: false };
      }

      return {
        success: false,
        requiresVerification: false,
        error: 'Authentication service unavailable.',
      };
    },
    [authMode, configurationError, getLocalUsers, saveLocalUsers]
  );

  const signOut = useCallback(async () => {
    if (authMode === 'cloud' && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('[Auth] Supabase sign out notice:', e);
      }
    }

    localStorage.removeItem(LOCAL_SESSION_KEY);
    setUser(null);
    setSession(null);
    setProfile(null);
    setError(null);
  }, [authMode]);

  const requestPasswordReset = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      setError(null);
      const cleanEmail = email.trim().toLowerCase();

      if (authMode === 'unconfigured') {
        const msg =
          configurationError ||
          'Cloud password reset is not configured in this production environment.';
        setError(msg);
        return { success: false, error: msg };
      }

      if (authMode === 'cloud' && supabase) {
        try {
          const { error: sbError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          if (sbError) {
            console.warn('[Auth] Supabase reset request notice:', sbError);
          }
          return { success: true };
        } catch (e: unknown) {
          const err = e instanceof Error ? e.message : 'Network error.';
          return { success: false, error: err };
        }
      }

      // Development mock: always return success to preserve email non-enumeration parity
      return { success: true };
    },
    [authMode, configurationError]
  );

  const resetPassword = useCallback(
    async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
      setError(null);

      if (authMode === 'unconfigured') {
        const msg = configurationError || 'Cloud authentication is not configured.';
        setError(msg);
        return { success: false, error: msg };
      }

      if (authMode === 'cloud' && supabase) {
        try {
          const { error: sbError } = await supabase.auth.updateUser({
            password: newPassword,
          });
          if (sbError) {
            setError(sbError.message);
            return { success: false, error: sbError.message };
          }
          return { success: true };
        } catch (e: unknown) {
          const err = e instanceof Error ? e.message : 'Failed to update password.';
          setError(err);
          return { success: false, error: err };
        }
      }

      if (authMode === 'mock' && user) {
        const users = getLocalUsers();
        const updated = users.map((u) =>
          u.id === user.id
            ? { ...u, passwordHash: btoa(newPassword), updatedAt: new Date().toISOString() }
            : u
        );
        saveLocalUsers(updated);
        return { success: true };
      }

      return { success: false, error: 'No active recovery session found.' };
    },
    [authMode, configurationError, user, getLocalUsers, saveLocalUsers]
  );

  const resendVerificationEmail = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      setError(null);
      const cleanEmail = email.trim().toLowerCase();

      if (authMode === 'cloud' && supabase) {
        try {
          const { error: sbError } = await supabase.auth.resend({
            type: 'signup',
            email: cleanEmail,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });
          if (sbError) {
            setError(sbError.message);
            return { success: false, error: sbError.message };
          }
          return { success: true };
        } catch (e: unknown) {
          const err = e instanceof Error ? e.message : 'Failed to resend verification email.';
          return { success: false, error: err };
        }
      }

      return { success: true };
    },
    [authMode]
  );

  const completeOnboarding = useCallback(
    async (data: OnboardingData): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: 'User must be signed in to complete onboarding.' };

      const updatedProfile: UserProfile = {
        ...(profile || {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        }),
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
        publicationName: data.publicationName,
        publicationTagline: data.publicationTagline,
        primaryLanguage: data.primaryLanguage,
        preferredPageSize: data.preferredPageSize,
        role: data.role || 'owner',
        isOnboarded: true,
        updatedAt: new Date().toISOString(),
      };

      setProfile(updatedProfile);

      publisherProfileStorage.saveProfile({
        publisherName: data.fullName,
        newspaperTitle: data.publicationName,
        tagline: data.publicationTagline,
        primaryLanguage: data.primaryLanguage,
        preferredPageSize: data.preferredPageSize,
        email: user.email,
        isOnboarded: true,
      });

      if (authMode === 'cloud' && supabase) {
        try {
          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            full_name: data.fullName,
            avatar_url: data.avatarUrl,
            primary_language: data.primaryLanguage,
            preferred_page_size: data.preferredPageSize,
            is_onboarded: true,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('[Auth] Remote profile sync notice:', e);
        }
      } else if (authMode === 'mock') {
        const users = getLocalUsers();
        const updated = users.map((u) =>
          u.id === user.id
            ? {
                ...u,
                fullName: data.fullName,
                avatarUrl: data.avatarUrl,
                publicationName: data.publicationName,
                publicationTagline: data.publicationTagline,
                primaryLanguage: data.primaryLanguage,
                preferredPageSize: data.preferredPageSize,
                isOnboarded: true,
                updatedAt: new Date().toISOString(),
              }
            : u
        );
        saveLocalUsers(updated);
      }

      return { success: true };
    },
    [user, profile, authMode, getLocalUsers, saveLocalUsers]
  );

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
      if (!user || !profile) return { success: false, error: 'Not authenticated.' };

      const merged: UserProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      setProfile(merged);

      if (updates.fullName) {
        setUser((prev) => (prev ? { ...prev, fullName: updates.fullName! } : null));
      }

      publisherProfileStorage.saveProfile({
        publisherName: merged.fullName,
        newspaperTitle: merged.publicationName,
        tagline: merged.publicationTagline,
        primaryLanguage: merged.primaryLanguage,
        preferredPageSize: merged.preferredPageSize,
      });

      if (authMode === 'cloud' && supabase) {
        try {
          await supabase
            .from('profiles')
            .update({
              full_name: merged.fullName,
              avatar_url: merged.avatarUrl,
              primary_language: merged.primaryLanguage,
              preferred_page_size: merged.preferredPageSize,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
        } catch (e) {
          console.warn('[Auth] Remote profile update notice:', e);
        }
      } else if (authMode === 'mock') {
        const users = getLocalUsers();
        saveLocalUsers(
          users.map((u) =>
            u.id === user.id ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u
          )
        );
      }

      return { success: true };
    },
    [user, profile, authMode, getLocalUsers, saveLocalUsers]
  );

  const changePassword = useCallback(
    async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
      return resetPassword(newPassword);
    },
    [resetPassword]
  );

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      profile,
      session,
      isLoading,
      isAuthenticated: Boolean(user && session),
      isOnboarded: Boolean(profile?.isOnboarded),
      error,
      isCloudConnected: authMode === 'cloud',
      authMode,
      configurationError,
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      resetPassword,
      resendVerificationEmail,
      completeOnboarding,
      updateProfile,
      changePassword,
      clearError,
    }),
    [
      user,
      profile,
      session,
      isLoading,
      error,
      authMode,
      configurationError,
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      resetPassword,
      resendVerificationEmail,
      completeOnboarding,
      updateProfile,
      changePassword,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
