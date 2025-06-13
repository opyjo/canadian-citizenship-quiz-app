export type UIState =
  | "LOADING"
  | "SUBMITTING"
  | "SHOWING_FEEDBACK"
  | "SHOWING_MODAL"
  | "SHOWING_QUIZ"
  | "UNAUTHENTICATED_RESULTS";

export interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onClose?: () => void;
}

export interface UIStateSlice {
  uiState: UIState;
  loadingMessage: string;
  feedbackMessage: string | null;
  modalState: ModalState;
}

export type UIAction =
  | { type: "LOADING"; message: string }
  | { type: "SUBMITTING" }
  | { type: "SHOW_FEEDBACK"; message: string }
  | { type: "SHOW_MODAL"; payload: ModalState }
  | { type: "CLOSE_MODAL" }
  | { type: "SHOW_QUIZ" }
  | { type: "UNAUTHENTICATED_RESULTS" };
