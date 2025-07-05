export interface UIState {
  isLoading: boolean;
  activeModal: string | null;
  toasts: Toast[];
  theme: "light" | "dark" | "system";
}

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

export interface UIActions {
  setLoading: (isLoading: boolean) => void;
  showModal: (modalId: string) => void;
  hideModal: () => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  setTheme: (theme: UIState["theme"]) => void;
}

export type UIStore = UIState & UIActions;
