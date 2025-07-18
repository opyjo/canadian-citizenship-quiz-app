import { UIState } from "./types";

export const selectIsLoading = (state: UIState) => state.isLoading;
export const selectActiveModal = (state: UIState) => state.activeModal;
export const selectToasts = (state: UIState) => state.toasts;
export const selectTheme = (state: UIState) => state.theme;

// Derived selectors
export const selectHasActiveModal = (state: UIState) =>
  state.activeModal !== null;
export const selectToastCount = (state: UIState) => state.toasts.length;
