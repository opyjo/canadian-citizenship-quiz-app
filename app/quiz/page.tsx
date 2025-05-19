"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import supabaseClient from "@/lib/supabase-client";
import { Loader2 } from "lucide-react";
import ConfirmationModal from "@/components/confirmation-modal";
import {
  checkAttemptLimits,
  incrementLocalAttemptCount,
  type QuizMode,
} from "@/lib/quizLimits";
import Link from "next/link";

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

export default function QuizPage() {
  const router = useRouter();
  const supabase = supabaseClient;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmEndQuizModalOpen, setIsConfirmEndQuizModalOpen] =
    useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [isAccessChecked, setIsAccessChecked] = useState(false);
  const [limitModalState, setLimitModalState] = useState<{
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
    async function performAccessCheckAndFetchData() {
      const accessResult = await checkAttemptLimits("standard", supabase);
      setIsAccessChecked(true);

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUserId(authUser?.id || null);

      if (!accessResult.canAttempt) {
        setLoading(false);
        setQuestions([]);
        let confirmText = "OK";
        let onConfirmAction = () => router.push("/");
        if (!accessResult.isLoggedIn) {
          confirmText = "Sign Up";
          onConfirmAction = () => router.push("/signup");
        } else if (!accessResult.isPaidUser) {
          confirmText = "Upgrade Plan";
          onConfirmAction = () => router.push("/pricing");
        }
        setLimitModalState({
          isOpen: true,
          title: "Access Denied",
          message: accessResult.message,
          confirmText,
          cancelText: "Go Home",
          onConfirm: () => {
            onConfirmAction();
            setLimitModalState({ ...limitModalState, isOpen: false });
          },
          onClose: () => {
            router.push("/");
            setLimitModalState({ ...limitModalState, isOpen: false });
          },
        });
        return;
      }

      setLoading(true);
      try {
        const { data: idObjects, error: idError } = await supabase
          .from("questions")
          .select("id");
        if (idError) throw new Error(idError.message);
        if (!idObjects || idObjects.length === 0)
          throw new Error("No question IDs found.");

        let questionIds = idObjects.map((item) => item.id);
        for (let i = questionIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [questionIds[i], questionIds[j]] = [questionIds[j], questionIds[i]];
        }
        const selectedIds = questionIds.slice(0, 20);

        if (selectedIds.length === 0) {
          setQuestions([]);
          setError("Not enough questions to start a quiz.");
          setLoading(false);
          return;
        }

        const { data, error: questionsFetchError } = await supabase
          .from("questions")
          .select("*")
          .in("id", selectedIds);
        if (questionsFetchError) throw new Error(questionsFetchError.message);

        if (data) {
          const questionMap = new Map(data.map((q) => [q.id, q]));
          const orderedQuestions = selectedIds
            .map((id) => questionMap.get(id))
            .filter(Boolean) as Question[];
          setQuestions(orderedQuestions);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError((err as Error).message || "Failed to load questions.");
      } finally {
        setLoading(false);
      }
    }

    performAccessCheckAndFetchData();
  }, [supabase, router]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  const handleAnswerSelect = (option: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: option,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleEndQuiz = () => {
    setIsConfirmEndQuizModalOpen(true);
  };

  const finishQuiz = async () => {
    if (!userId) {
      incrementLocalAttemptCount("standard");
    }

    const questionIds = questions.map((q) => q.id);
    const userAnswersForApi: Record<string, string> = {};
    for (const key in selectedAnswers) {
      userAnswersForApi[String(key)] = selectedAnswers[key];
    }

    try {
      const response = await fetch("/api/quiz-attempt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAnswers: userAnswersForApi,
          questionIds: questionIds,
          isTimed: false,
          timeTaken: null,
          isPractice: false,
          practiceType: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save quiz attempt");
      }

      const result = await response.json();
      const attemptId = result.attemptId;

      if (attemptId) {
        router.push(`/results/${attemptId}`);
      } else {
        throw new Error("No attempt ID received from API");
      }
    } catch (err: any) {
      console.error("Error submitting quiz:", err);
      setError(err.message || "Failed to submit quiz. Please try again.");
    }
  };

  if (limitModalState.isOpen) {
    return (
      <ConfirmationModal
        isOpen={limitModalState.isOpen}
        title={limitModalState.title}
        message={limitModalState.message}
        confirmText={limitModalState.confirmText}
        cancelText={limitModalState.cancelText}
        onConfirm={limitModalState.onConfirm}
        onClose={
          limitModalState.onClose ||
          (() => setLimitModalState({ ...limitModalState, isOpen: false }))
        }
      />
    );
  }

  if (!isAccessChecked && loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Checking access...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")}>Return Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!currentQuestion && !loading && isAccessChecked) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              There are no questions available for this quiz at the moment, or
              you may have encountered an issue.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")}>Return Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Preparing quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 px-4">
      <div className="max-w-3xl w-full space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
            <span className="text-sm text-muted-foreground">
              {selectedAnswers[currentQuestionIndex]
                ? "Answered"
                : "Not answered"}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">
              {currentQuestion.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {["a", "b", "c", "d"].map((option) => (
              <div
                key={option}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAnswers[currentQuestionIndex] === option
                    ? "border-red-600 bg-red-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleAnswerSelect(option)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      selectedAnswers[currentQuestionIndex] === option
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    <span className="text-sm">{option.toUpperCase()}</span>
                  </div>
                  <span>
                    {currentQuestion[`option_${option}` as keyof Question]}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button
              variant="destructive"
              onClick={handleEndQuiz}
              className="mr-auto"
            >
              End Quiz
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedAnswers[currentQuestionIndex]}
              >
                {currentQuestionIndex === questions.length - 1
                  ? "Finish Quiz"
                  : "Next Question"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <ConfirmationModal
        isOpen={isConfirmEndQuizModalOpen}
        onClose={() => setIsConfirmEndQuizModalOpen(false)}
        onConfirm={() => {
          finishQuiz();
          setIsConfirmEndQuizModalOpen(false);
        }}
        title="End Quiz?"
        message="Are you sure you want to end the quiz? Your current answers will be submitted, and you will be taken to the results page."
        confirmText="End Quiz"
        cancelText="Continue Quiz"
      />
    </div>
  );
}

// Sample questions for demo purposes when Supabase is not set up
function getSampleQuestions(): Question[] {
  return [
    {
      id: 1,
      question_text:
        "When must a federal election be held according to legislation passed by parliament?",
      option_a: "When the king wants to replace the prime minister",
      option_b: "Within four years of the most recent election",
      option_c: "Within 5 years of the last election",
      option_d:
        "The prime minister can call the election any time at his own will",
      correct_option: "b",
    },
    {
      id: 2,
      question_text:
        "Which of the following is the federal government responsible for?",
      option_a: "Highways",
      option_b: "Natural resources",
      option_c: "Education",
      option_d: "Interprovincial trade and communications",
      correct_option: "d",
    },
    {
      id: 3,
      question_text:
        "What was the name of the new country formed at confederation?",
      option_a: "Britain",
      option_b: "Canada",
      option_c: "Canadian Confederation",
      option_d: "Dominion of Canada",
      correct_option: "d",
    },
    {
      id: 4,
      question_text: "Where do more than half of the people in Canada live?",
      option_a: "Coastal Pacific",
      option_b: "Atlantic Canada",
      option_c: "Prairies",
      option_d: "Central Canada",
      correct_option: "d",
    },
    {
      id: 5,
      question_text: "Who brought Quebec into confederation?",
      option_a: "Sir Lewis Hippoly La Fontaine",
      option_b: "Sir George-Étienne Cartier",
      option_c: "Sir Wilfried Laurier",
      option_d: "Sir John Alexander Macdonald",
      correct_option: "b",
    },
    // Add more sample questions to make 20 total
    {
      id: 6,
      question_text:
        "In World War II how did Canada contribute more to the Allied air effort than any other Commonwealth country?",
      option_a: "Trained 130,000 Allied air crew",
      option_b: "Deployed paratroopers in France",
      option_c: "Provided ammunition",
      option_d: "Sent 130,000 soldiers to take France back from the Germans",
      correct_option: "a",
    },
    {
      id: 7,
      question_text: "How can a party in power be defeated in parliament?",
      option_a: "If there is a revolution",
      option_b: "If the king orders the party to resign",
      option_c:
        "If a majority of the MPs vote against a major government decision",
      option_d:
        "If a minority of the MPs vote against a major government decision",
      correct_option: "c",
    },
    {
      id: 8,
      question_text:
        "Which of the following are the responsibilities of provincial government?",
      option_a: "Education, healthcare, natural resources and policing",
      option_b: "National defense, healthcare, citizenship and firefighting",
      option_c: "Education, foreign policy, natural resources and policing",
      option_d:
        "National defense, foreign policy, highways and Aboriginal affairs",
      correct_option: "a",
    },
    {
      id: 9,
      question_text: "What was the Underground Railroad?",
      option_a:
        "An anti-slavery network that helped thousands of slaves escape the United States and settle in Canada",
      option_b:
        "A railroad through the Rockies that was mainly through mountain tunnels",
      option_c:
        "A network fur traders used to transport beaver pelts to the United States",
      option_d: "The first underground subway tunnel in Toronto",
      correct_option: "a",
    },
    {
      id: 10,
      question_text: "Which region covers more than one-third of Canada?",
      option_a: "Northern Territories",
      option_b: "South region",
      option_c: "North region",
      option_d: "Southern Territories",
      correct_option: "a",
    },
    {
      id: 11,
      question_text: "What is the name of the royal anthem of Canada?",
      option_a: "Great Canada",
      option_b: "O Canada",
      option_c: "God save the queen or king",
      option_d: "O Canada",
      correct_option: "c",
    },
    {
      id: 12,
      question_text: "What is the primary role of the police in Canada?",
      option_a: "To resolve disputes and interpret law",
      option_b: "To keep people safe and to enforce the law",
      option_c: "To provide national security intelligence to the government",
      option_d:
        "To conduct or support land warfare, peacekeeping or humanitarian missions",
      correct_option: "b",
    },
    {
      id: 13,
      question_text: "Which province has the most bilingual Canadians?",
      option_a: "British Columbia",
      option_b: "Quebec",
      option_c: "Ontario",
      option_d: "New Brunswick",
      correct_option: "b",
    },
    {
      id: 14,
      question_text:
        "Which province is one of the most productive agricultural regions in the world?",
      option_a: "Manitoba",
      option_b: "Saskatchewan",
      option_c: "British Columbia",
      option_d: "Alberta",
      correct_option: "b",
    },
    {
      id: 15,
      question_text: "When is Canada Day?",
      option_a: "November 11th",
      option_b: "July 1st",
      option_c: "October 1st",
      option_d: "July 4th",
      correct_option: "b",
    },
    {
      id: 16,
      question_text: "In what year did Canada become a country?",
      option_a: "1867",
      option_b: "1687",
      option_c: "1786",
      option_d: "1778",
      correct_option: "a",
    },
    {
      id: 17,
      question_text: "The two official languages of Canada are:",
      option_a: "Inuktitut and English",
      option_b: "French and Inuktitut",
      option_c: "English and French",
      option_d: "Mandarin and English",
      correct_option: "c",
    },
    {
      id: 18,
      question_text: "Where is Canada located?",
      option_a: "Central America",
      option_b: "Europe",
      option_c: "North America",
      option_d: "South America",
      correct_option: "c",
    },
    {
      id: 19,
      question_text:
        "Can you name the five great lakes between Canada and the US?",
      option_a:
        "Lake Toronto, Lake Michigan, Lake Mexico, Lake Ontario, Lake St. Louis",
      option_b:
        "Lake Superior, Lake Michigan, Lake Huron, Lake Erie, Lake Ontario",
      option_c:
        "Lake Michigan, Lake Victoria, Lake Mexico, Lake Ontario, Lake St. Louis",
      option_d: "None of the above",
      correct_option: "b",
    },
    {
      id: 20,
      question_text:
        "What do you call the king's representative in the provinces?",
      option_a: "Governor lieutenant",
      option_b: "King's governor",
      option_c: "Lieutenant Governor",
      option_d: "Governor General",
      correct_option: "c",
    },
  ];
}
