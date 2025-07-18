// stores/auth-store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import supabaseClient from "@/lib/supabase-client";
import { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  subscription: {
    status: "active" | "trialing" | "canceled" | "expired" | null;
    cancelAtPeriodEnd: boolean;
  };
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setSubscription: (subscription: AuthState["subscription"]) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<(() => void) | undefined>;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  isLoading: true,
  subscription: {
    status: null,
    cancelAtPeriodEnd: false,
  },
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setUser: (user) => set({ user }),
        setLoading: (isLoading) => set({ isLoading }),
        setSubscription: (subscription) => set({ subscription }),

        signOut: async () => {
          try {
            set({ isLoading: true });
            await supabaseClient.auth.signOut();
            set({
              user: null,
              subscription: {
                status: null,
                cancelAtPeriodEnd: false,
              },
            });
          } catch (error) {
            console.error("Sign out error:", error);
          } finally {
            set({ isLoading: false });
          }
        },

        initialize: async () => {
          try {
            set({ isLoading: true });

            // Get initial session
            const {
              data: { session },
            } = await supabaseClient.auth.getSession();
            set({ user: session?.user ?? null });

            // Subscribe to auth changes
            const {
              data: { subscription },
            } = supabaseClient.auth.onAuthStateChange((_event, session) => {
              set({ user: session?.user ?? null });
            });

            // Cleanup function
            return () => {
              subscription.unsubscribe();
            };
          } catch (error) {
            console.error("Auth initialization error:", error);
          } finally {
            set({ isLoading: false });
          }
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          subscription: state.subscription,
        }),
      }
    ),
    {
      name: "Auth Store",
    }
  )
);
