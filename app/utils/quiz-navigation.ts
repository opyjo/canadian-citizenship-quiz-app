import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { checkQuizAccess } from "@/app/actions/check-quiz-access";
import { checkUnauthenticatedUserLimits } from "@/lib/quizlimits/helpers";
import { QuizMode } from "@/lib/quizlimits/constants";

interface QuizNavigationOptions {
  router: AppRouterInstance;
  user: any;
  onShowModal?: (modalConfig: {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }) => void;
}

/**
 * Reusable function to handle quiz navigation with access checks
 * @param quizMode - The type of quiz ("standard", "timed", "practice")
 * @param quizPath - The path to navigate to
 * @param options - Navigation options including router, user, and modal handler
 */
export async function handleStartQuiz(
  quizMode: QuizMode,
  quizPath: string,
  options: QuizNavigationOptions
): Promise<void> {
  const { router, user, onShowModal } = options;

  try {
    // Check access based on user authentication status
    const result = user
      ? await checkQuizAccess(quizMode)
      : await checkUnauthenticatedUserLimits(quizMode);

    if (result.canAttempt) {
      // User has access - navigate to quiz
      router.push(quizPath);
    } else {
      // User doesn't have access - show modal or fallback behavior
      if (onShowModal) {
        onShowModal({
          title: "Quiz Limit Reached",
          message: result.message,
          confirmText: result.isLoggedIn ? "Upgrade Plan" : "Sign Up",
          cancelText: result.isLoggedIn ? "OK" : "Later",
          onConfirm: () => {
            router.push(result.isLoggedIn ? "/pricing" : "/signup");
          },
        });
      } else {
        // Fallback: redirect to appropriate page
        const redirectPath = result.isLoggedIn ? "/pricing" : "/signup";
        router.push(redirectPath);
      }
    }
  } catch (error) {
    console.error("Error checking quiz access:", error);
    // On error, still try to navigate (graceful degradation)
    router.push(quizPath);
  }
}

/**
 * Helper function to determine quiz mode from path
 * @param path - The quiz path
 * @returns The corresponding quiz mode
 */
export function getQuizModeFromPath(path: string): QuizMode {
  if (path.includes("/timed")) return "timed";
  if (path.includes("/practice")) return "practice";
  return "standard";
}
