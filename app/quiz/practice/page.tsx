"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  answer_explanation: string | null;
  category: string | null;
}

export default function PracticeQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [practiceType, setPracticeType] = useState<string>("category");
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const supabase = supabaseClient;

  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Check if user is authenticated
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          setUserId(userData.user.id);
        }

        // Get query parameters
        const category = searchParams.get("category");
        const incorrect = searchParams.get("incorrect") === "true";

        if (incorrect) {
          setPracticeType("incorrect");

          if (!userData.user) {
            router.push("/auth");
            return;
          }

          // Fetch user's incorrect questions
          const { data: incorrectData, error: incorrectError } = await supabase
            .from("user_incorrect_questions")
            .select("question_id")
            .eq("user_id", userData.user.id);

          if (incorrectError) throw incorrectError;

          if (incorrectData && incorrectData.length > 0) {
            const questionIds = incorrectData.map((item) => item.question_id);

            // Fetch the actual questions
            const { data: questionData, error: questionError } = await supabase
              .from("questions")
              .select("*")
              .in("id", questionIds)
              .order("id")
              .limit(20);

            if (questionError) throw questionError;
            if (questionData) setQuestions(questionData);
          } else {
            // No incorrect questions found
            setError(
              "You don't have any incorrect questions to practice. Take some quizzes first!"
            );
          }
        } else if (category) {
          setPracticeType("category");
          setCategoryName(category);

          // Fetch questions by category
          const { data, error } = await supabase
            .from("questions")
            .select("*")
            .eq("category", category)
            .order("id")
            .limit(20);

          if (error) throw error;
          if (data) setQuestions(data);
        } else {
          // No valid practice type specified
          router.push("/practice");
          return;
        }
      } catch (err: any) {
        console.error("Error fetching questions:", err);
        setError(err.message || "Failed to load practice questions");

        // For demo purposes, load sample questions if Supabase is not set up
        setQuestions(getSampleQuestions());
      } finally {
        setLoading(false);
        setStartTime(Date.now());
      }
    }

    fetchInitialData();
  }, [supabase, searchParams, router, userId]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

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

  const finishQuiz = async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    // Calculate score
    const score = questions.filter(
      (q, index) => selectedAnswers[index] === q.correct_option
    ).length;

    // Save quiz attempt if user is logged in
    if (userId) {
      try {
        await supabase.from("quiz_attempts").insert({
          user_id: userId,
          score,
          total_questions: questions.length,
          time_taken: timeTaken,
          is_timed: false,
          quiz_type: "practice",
          category: categoryName,
        });

        // Update incorrect questions
        const incorrectQuestions = questions
          .filter(
            (q, index) =>
              selectedAnswers[index] !== q.correct_option &&
              selectedAnswers[index] !== undefined
          )
          .map((q) => ({
            user_id: userId,
            question_id: q.id,
          }));

        if (incorrectQuestions.length > 0) {
          await supabase.from("user_incorrect_questions").upsert(
            incorrectQuestions.map((q) => ({
              ...q,
              times_incorrect: 1,
            })),
            {
              onConflict: "user_id,question_id",
              ignoreDuplicates: false,
            }
          );
        }
      } catch (error) {
        console.error("Error saving quiz results:", error);
      }
    }

    // Navigate to results
    router.push(
      `/results?answers=${encodeURIComponent(
        JSON.stringify(selectedAnswers)
      )}&practice=true&practiceType=${practiceType}&category=${encodeURIComponent(
        categoryName || ""
      )}`
    );
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Loading practice questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/practice")}>
              Return to Practice
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!currentQuestion || questions.length === 0) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There are no questions available for this practice session.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/practice")}>
              Return to Practice
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-3xl w-full space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
            <div className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
              {practiceType === "category"
                ? categoryName
                : "Incorrect Questions"}
            </div>
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
          <CardFooter className="flex justify-between">
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
                ? "Finish Practice"
                : "Next Question"}
            </Button>
          </CardFooter>
        </Card>
      </div>
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
      answer_explanation:
        "According to Canadian legislation, a federal election must be held within four years of the most recent election.",
      category: "Government and Democracy",
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
      answer_explanation:
        "The federal government is responsible for interprovincial trade and communications, while highways, natural resources, and education typically fall under provincial jurisdiction.",
      category: "Government and Democracy",
    },
    // Add more sample questions with explanations and categories
    {
      id: 3,
      question_text:
        "What was the name of the new country formed at confederation?",
      option_a: "Britain",
      option_b: "Canada",
      option_c: "Canadian Confederation",
      option_d: "Dominion of Canada",
      correct_option: "d",
      answer_explanation:
        "At Confederation in 1867, the country was officially named the Dominion of Canada.",
      category: "Canadian History",
    },
    {
      id: 4,
      question_text: "Where do more than half of the people in Canada live?",
      option_a: "Coastal Pacific",
      option_b: "Atlantic Canada",
      option_c: "Prairies",
      option_d: "Central Canada",
      correct_option: "d",
      answer_explanation:
        "More than half of Canada's population lives in Central Canada, specifically in the provinces of Ontario and Quebec.",
      category: "Geography",
    },
    {
      id: 5,
      question_text: "Who brought Quebec into confederation?",
      option_a: "Sir Lewis Hippoly La Fontaine",
      option_b: "Sir George-Étienne Cartier",
      option_c: "Sir Wilfried Laurier",
      option_d: "Sir John Alexander Macdonald",
      correct_option: "b",
      answer_explanation:
        "Sir George-Étienne Cartier was instrumental in bringing Quebec into Confederation, serving as a key French-Canadian Father of Confederation.",
      category: "Canadian History",
    },
  ];
}
