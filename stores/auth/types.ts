import { User } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  subscription: {
    status: "active" | "trialing" | "canceled" | "expired" | null;
    cancelAtPeriodEnd: boolean;
  };
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setSubscription: (subscription: AuthState["subscription"]) => void;
  signOut: () => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<(() => void) | undefined>;
}

export type AuthStore = AuthState & AuthActions;
