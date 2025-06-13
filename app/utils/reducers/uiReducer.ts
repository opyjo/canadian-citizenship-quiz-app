import { UIStateSlice, UIAction } from "../ui";

export const initialUIState: UIStateSlice = {
  uiState: "LOADING",
  loadingMessage: "Checking access…",
  feedbackMessage: null,
  modalState: {
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: () => {},
    onClose: () => {},
  },
};

export function uiReducer(state: UIStateSlice, action: UIAction): UIStateSlice {
  switch (action.type) {
    case "LOADING":
      return {
        ...state,
        uiState: "LOADING",
        loadingMessage: action.message,
      };
    case "SUBMITTING":
      return {
        ...state,
        uiState: "SUBMITTING",
      };
    case "SHOW_FEEDBACK":
      return {
        ...state,
        uiState: "SHOWING_FEEDBACK",
        feedbackMessage: action.message,
      };
    case "SHOW_MODAL":
      return {
        ...state,
        uiState: "SHOWING_MODAL",
        modalState: action.payload,
      };
    case "CLOSE_MODAL":
      return {
        ...state,
        uiState: "LOADING",
        modalState: { ...state.modalState, isOpen: false },
      };
    case "SHOW_QUIZ":
      return {
        ...state,
        uiState: "SHOWING_QUIZ",
      };
    case "UNAUTHENTICATED_RESULTS":
      return {
        ...state,
        uiState: "UNAUTHENTICATED_RESULTS",
      };
    default:
      return state;
  }
}
