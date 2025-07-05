import { AuthState } from "./types";

export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.user !== null;
export const selectAuthLoading = (state: AuthState) => state.isLoading;
export const selectAuthError = (state: AuthState) => state.error;
export const selectSubscription = (state: AuthState) => state.subscription;

// Derived selectors
export const selectIsSubscribed = (state: AuthState) =>
  state.subscription.status === "active" ||
  state.subscription.status === "trialing";

export const selectCanAccessPremiumFeatures = (state: AuthState) =>
  selectIsSubscribed(state) && !state.subscription.cancelAtPeriodEnd;
