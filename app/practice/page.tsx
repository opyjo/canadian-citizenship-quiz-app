"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import supabaseClient from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertTriangle, Shuffle } from "lucide-react";
import { checkAttemptLimits, type QuizMode } from "@/lib/quizLimits";
import ConfirmationModal from "@/components/confirmation-modal";

export default function PracticePage() {
  const [incorrectQuestionsCount, setIncorrectQuestionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = supabaseClient;

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onClose?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: () => {},
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        setUser(userData.user);

        if (userData.user) {
          const { data: incorrectData, error: incorrectError } = await supabase
            .from("user_incorrect_questions")
            .select("question_id", { count: "exact" })
            .eq("user_id", userData.user.id);

          if (incorrectError) throw incorrectError;
          setIncorrectQuestionsCount(incorrectData?.length || 0);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load practice data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase]);

  const handleStartQuizFlow = async (
    quizMode: QuizMode,
    quizPath: string,
    actionName: string
  ) => {
    const result = await checkAttemptLimits(quizMode, supabase);

    if (result.canAttempt) {
      console.log(
        `[PracticePage] Access granted for ${actionName}. Navigating to ${quizPath}`
      );
      router.push(quizPath);
    } else {
      console.log(
        `[PracticePage] Access denied for ${actionName}. Reason: ${result.reason}, Message: ${result.message}`
      );
      let confirmText = "OK";
      let cancelText = "Later";
      let onConfirmAction = () =>
        setModalState({ ...modalState, isOpen: false });

      if (!result.isLoggedIn) {
        confirmText = "Sign Up";
        onConfirmAction = () => router.push("/signup");
      } else if (!result.isPaidUser) {
        confirmText = "Upgrade Plan";
        onConfirmAction = () => router.push("/pricing");
      }

      setModalState({
        isOpen: true,
        title: "Practice Limit Reached",
        message: result.message,
        confirmText,
        cancelText,
        onConfirm: () => {
          onConfirmAction();
          setModalState({ ...modalState, isOpen: false });
        },
        onClose: () => setModalState({ ...modalState, isOpen: false }),
      });
    }
  };

  const startQuickPractice = (count: number) => {
    handleStartQuizFlow(
      "practice",
      `/quiz/practice?mode=random&count=${count}`,
      `Quick Practice (${count} questions)`
    );
  };

  const startPracticeIncorrect = () => {
    if (!user) {
      setModalState({
        isOpen: true,
        title: "Sign In Required",
        message:
          "You need to be signed in to practice your incorrect questions.",
        confirmText: "Sign In",
        cancelText: "Later",
        onConfirm: () => router.push("/auth"),
        onClose: () => setModalState({ ...modalState, isOpen: false }),
      });
      return;
    }
    if (incorrectQuestionsCount === 0 && user) {
      setModalState({
        isOpen: true,
        title: "No Incorrect Questions",
        message: "You have no incorrect questions to practice. Great job!",
        confirmText: "OK",
        cancelText: "",
        onConfirm: () => setModalState({ ...modalState, isOpen: false }),
        onClose: () => setModalState({ ...modalState, isOpen: false }),
      });
      return;
    }
    handleStartQuizFlow(
      "practice",
      "/quiz/practice?incorrect=true",
      "Practice Incorrect Questions"
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Loading practice options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Practice Mode</h1>
          <p className="text-muted-foreground">
            Test your knowledge with a random mix of questions or focus on
            questions you've answered incorrectly.
          </p>
        </div>

        {/* Quick Practice Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shuffle className="mr-2 h-6 w-6 text-red-600" />
              Quick Practice
            </CardTitle>
            <CardDescription>
              Start a practice session with a random selection of questions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Choose the number of questions for your random quiz:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[10, 20, 50].map((count) => (
                <Button
                  key={count}
                  variant="outline"
                  className="w-full py-6 text-lg"
                  onClick={() => startQuickPractice(count)}
                >
                  {count} Questions
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Practice Incorrect Questions Section - No longer in a Tab */}
        {!user ? (
          <Card>
            <CardHeader>
              <CardTitle>Sign In Required for Incorrect Questions</CardTitle>
              <CardDescription>
                Sign in to track and practice questions you've answered
                incorrectly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                <p>
                  Practicing incorrect questions requires an account to track
                  your quiz history.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/auth" className="w-full">
                <Button className="w-full" variant="default">
                  Sign In or Create Account
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ) : incorrectQuestionsCount === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Incorrect Questions</CardTitle>
              <CardDescription>
                You haven't answered any questions incorrectly yet, or you
                haven't taken any quizzes. Great job!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p>Keep up the good work!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle>Practice Incorrect Questions</CardTitle>
              <CardDescription>
                You have {incorrectQuestionsCount} question
                {incorrectQuestionsCount !== 1 ? "s" : ""} answered incorrectly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span>Focus on the questions you found tricky.</span>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t">
              <Button
                className="w-full"
                variant="secondary"
                onClick={startPracticeIncorrect}
                disabled={!user || incorrectQuestionsCount === 0}
              >
                Practice {incorrectQuestionsCount} Incorrect Question
                {incorrectQuestionsCount !== 1 ? "s" : ""}
              </Button>
            </CardFooter>
          </Card>
        )}

        {error && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-900/30">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-400">
                An Error Occurred
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 dark:text-red-300">{error}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please try refreshing the page. If the problem persists, some
                data might be temporarily unavailable.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        onConfirm={modalState.onConfirm}
        onClose={() =>
          modalState.onClose
            ? modalState.onClose()
            : setModalState({ ...modalState, isOpen: false })
        }
      />
    </div>
  );
}
