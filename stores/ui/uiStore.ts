import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { UIStore, UIState, Toast } from "./types";

const initialState: UIState = {
  isLoading: false,
  activeModal: null,
  toasts: [],
  theme: "system",
};

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setLoading: (isLoading) => set({ isLoading }),

      showModal: (modalId) => set({ activeModal: modalId }),

      hideModal: () => set({ activeModal: null }),

      addToast: (toast) =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            { ...toast, id: Math.random().toString(36).substring(7) },
          ],
        })),

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        })),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "UI Store",
    }
  )
);
