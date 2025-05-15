"use client";

import { useState, useEffect, useCallback } from "react";
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
import Timer from "@/components/timer";
import ConfirmationModal from "@/components/confirmation-modal";

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

export default function TimedQuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [originalQuestions, setOriginalQuestions] = useState<Question[]>([]);
  const [quizActive, setQuizActive] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(60 * 15); // 15 minutes in seconds
  const [quizFinished, setQuizFinished] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const TIME_LIMIT = 60 * 15; // 15 minutes in seconds

  const handleEndQuiz = useCallback(() => {
    setIsConfirmModalOpen(true);
  }, []);

  const finishQuiz = useCallback(async () => {
    if (quizFinished) return;
    setQuizFinished(true);
    setQuizActive(false);
    // Calculate time taken. Ensure startTime was set when the quiz began.
    const timeTakenSeconds =
      startTime > 0
        ? Math.floor((Date.now() - startTime) / 1000)
        : TIME_LIMIT - timeRemaining;

    const questionIds = originalQuestions.map((q) => q.id);

    // Ensure selectedAnswers keys are strings
    const userAnswersForApi: Record<string, string> = {};
    for (const key in selectedAnswers) {
      userAnswersForApi[String(key)] = selectedAnswers[key];
    }

    // setLoading(true); // Optional: indicate loading
    // setError(null);

    try {
      const response = await fetch("/api/quiz-attempt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAnswers: userAnswersForApi,
          questionIds: questionIds,
          isTimed: true,
          timeTaken: timeTakenSeconds,
          isPractice: false, // Assuming timed quiz is not a practice quiz by default
          practiceType: null,
          category: null, // Or a specific category if applicable to all timed quizzes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save timed quiz attempt");
      }

      const result = await response.json();
      const attemptId = result.attemptId;

      if (attemptId) {
        router.push(`/results/${attemptId}`);
      } else {
        throw new Error("No attempt ID received from API for timed quiz");
      }
    } catch (err: any) {
      console.error("Error submitting timed quiz:", err);
      setError(err.message || "Failed to submit timed quiz. Please try again.");
      // Optional: redirect to home or show error inline
    } finally {
      // setLoading(false);
    }

    // The existing logic for saving incorrect questions if userId is present can be kept or refactored.
    // For now, it's outside the new API call flow but was part of the original function.
    // Consider if this should also move to the API route or be triggered differently.
    if (userId) {
      let newScore = 0;
      const incorrectQs: {
        question_id: number;
        user_answer: string;
        correct_answer: string;
        question_text: string;
      }[] = [];

      questions.forEach((question, index) => {
        const userAnswer = selectedAnswers[index];
        if (
          userAnswer &&
          question.correct_option.toLowerCase() === userAnswer.toLowerCase()
        ) {
          newScore++;
        } else if (userAnswer) {
          const qIdAsNumber = Number(question.id);
          if (isNaN(qIdAsNumber)) {
            console.error(
              `Invalid question.id: ${question.id} cannot be converted to a number.`
            );
            return;
          }
          incorrectQs.push({
            question_id: qIdAsNumber,
            user_answer: userAnswer,
            correct_answer: question.correct_option,
            question_text: question.question_text,
          });
        }
      });

      try {
        // This was the old way of saving, the API route now handles the primary attempt saving.
        // The quiz_attempts insert here is now redundant if the API call above succeeds.
        // await supabaseClient.from("quiz_attempts").insert({ ... });

        if (incorrectQs.length > 0) {
          await supabaseClient.from("user_incorrect_questions").upsert(
            incorrectQs.map((iq) => ({ ...iq, user_id: userId })), // ensure user_id is part of the object
            {
              onConflict: "user_id, question_id",
              ignoreDuplicates: false,
            }
          );
        }
      } catch (dbError) {
        console.error("Error saving user incorrect questions:", dbError);
      }
    }
  }, [
    quizFinished,
    setQuizActive,
    startTime,
    timeRemaining,
    originalQuestions,
    selectedAnswers,
    router,
    userId, // Added userId here as it's used in the latter part
    questions, // Added questions here as it's used for score calculation for incorrectQs
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && quizActive) {
      finishQuiz();
    }
    return () => clearInterval(timer);
  }, [quizActive, timeRemaining, finishQuiz]);

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

  const handleTimeUp = () => {
    finishQuiz();
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 1. Fetch all question IDs
        const { data: idObjects, error: idError } = await supabaseClient
          .from("questions")
          .select("id");

        if (idError) {
          console.error("Supabase error fetching IDs (timed):", idError);
          throw new Error(idError.message);
        }

        if (!idObjects || idObjects.length === 0) {
          throw new Error("No question IDs found (timed).");
        }

        // Ensure questionIds are numbers, assuming item.id from DB is number
        let questionIds = idObjects.map((item: { id: number }) => item.id);

        // 2. Shuffle the IDs (Fisher-Yates shuffle algorithm)
        for (let i = questionIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [questionIds[i], questionIds[j]] = [questionIds[j], questionIds[i]];
        }

        // 3. Take the first 20 IDs (or fewer if not enough questions)
        const selectedIds = questionIds.slice(0, 20);

        if (selectedIds.length === 0) {
          setQuestions([]);
          setError("Not enough questions to start a timed quiz.");
          setLoading(false);
          return;
        }

        // 4. Fetch the full data for these 20 questions
        const { data, error } = await supabaseClient
          .from("questions")
          .select("*")
          .in("id", selectedIds);

        if (error) {
          console.error(
            "Supabase error fetching questions by ID (timed):",
            error
          );
          throw new Error(error.message);
        }

        if (data) {
          const questionMap = new Map(data.map((q: Question) => [q.id, q]));
          const orderedQuestions = selectedIds
            .map((id: number) => questionMap.get(id)) // id is now number
            .filter(Boolean) as Question[];
          setQuestions(orderedQuestions);
          setOriginalQuestions(orderedQuestions);
          setError(null);
        } else {
          setQuestions([]);
          setError("No questions returned for the timed quiz.");
        }
      } catch (err: any) {
        console.error("Error in fetchData (timed):", err);
        setError(err.message || "Failed to load questions for timed quiz.");
        setQuestions([]);
      } finally {
        setLoading(false);
        setStartTime(Date.now());
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Loading questions...</p>
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
            <Button onClick={() => router.push("/")}>Return Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              There are no questions available at this time. Please try again
              later.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")}>Return Home</Button>
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
            <Timer initialTime={TIME_LIMIT} onTimeUp={handleTimeUp} />
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
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          finishQuiz();
          setIsConfirmModalOpen(false);
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
      answer_explanation:
        "Canada made a significant contribution to the Allied air effort in World War II by training 130,000 Allied air crew through the British Commonwealth Air Training Plan.",
      category: "Canadian History",
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
      answer_explanation:
        "A party in power can be defeated if a majority of the Members of Parliament (MPs) vote against a major government decision, which is known as losing a confidence vote.",
      category: "Government and Democracy",
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
      answer_explanation:
        "Provincial governments in Canada are responsible for education, healthcare, natural resources, and policing within their jurisdictions.",
      category: "Government and Democracy",
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
      answer_explanation:
        "The Underground Railroad was a network of secret routes and safe houses used by enslaved African Americans to escape to free states and Canada with the aid of abolitionists and allies who were sympathetic to their cause.",
      category: "Canadian History",
    },
    {
      id: 10,
      question_text: "Which region covers more than one-third of Canada?",
      option_a: "Northern Territories",
      option_b: "South region",
      option_c: "North region",
      option_d: "Southern Territories",
      correct_option: "a",
      answer_explanation:
        "The Northern Territories (Yukon, Northwest Territories, and Nunavut) cover more than one-third of Canada's land mass.",
      category: "Geography",
    },
    {
      id: 11,
      question_text: "What is the name of the royal anthem of Canada?",
      option_a: "Great Canada",
      option_b: "O Canada",
      option_c: "God save the queen or king",
      option_d: "O Canada",
      correct_option: "c",
      answer_explanation:
        "The royal anthem of Canada is 'God Save the Queen' (or 'God Save the King' when the monarch is male).",
      category: "Canadian Symbols and Identity",
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
      answer_explanation:
        "The primary role of the police in Canada is to keep people safe and to enforce the law.",
      category: "Rights and Responsibilities",
    },
    {
      id: 13,
      question_text: "Which province has the most bilingual Canadians?",
      option_a: "British Columbia",
      option_b: "Quebec",
      option_c: "Ontario",
      option_d: "New Brunswick",
      correct_option: "b",
      answer_explanation:
        "Quebec has the most bilingual Canadians, with a significant portion of the population able to speak both English and French.",
      category: "Geography",
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
      answer_explanation:
        "Saskatchewan is known as one of the most productive agricultural regions in the world, particularly for grain production.",
      category: "Geography",
    },
    {
      id: 15,
      question_text: "When is Canada Day?",
      option_a: "November 11th",
      option_b: "July 1st",
      option_c: "October 1st",
      option_d: "July 4th",
      correct_option: "b",
      answer_explanation:
        "Canada Day is celebrated on July 1st, commemorating the anniversary of Canadian Confederation in 1867.",
      category: "Canadian Symbols and Identity",
    },
    {
      id: 16,
      question_text: "In what year did Canada become a country?",
      option_a: "1867",
      option_b: "1687",
      option_c: "1786",
      option_d: "1778",
      correct_option: "a",
      answer_explanation:
        "Canada became a country on July 1, 1867, when the British North America Act united the colonies of Nova Scotia, New Brunswick, and the Province of Canada (which became Ontario and Quebec).",
      category: "Canadian History",
    },
    {
      id: 17,
      question_text: "The two official languages of Canada are:",
      option_a: "Inuktitut and English",
      option_b: "French and Inuktitut",
      option_c: "English and French",
      option_d: "Mandarin and English",
      correct_option: "c",
      answer_explanation:
        "The two official languages of Canada are English and French, as established by the Official Languages Act.",
      category: "Canadian Symbols and Identity",
    },
    {
      id: 18,
      question_text: "Where is Canada located?",
      option_a: "Central America",
      option_b: "Europe",
      option_c: "North America",
      option_d: "South America",
      correct_option: "c",
      answer_explanation:
        "Canada is located in the northern part of North America, bordering the United States to the south and extending to the Arctic Ocean in the north.",
      category: "Geography",
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
      answer_explanation:
        "The five Great Lakes between Canada and the United States are Lake Superior, Lake Michigan, Lake Huron, Lake Erie, and Lake Ontario.",
      category: "Geography",
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
      answer_explanation:
        "The king's (or queen's) representative in each province is called the Lieutenant Governor.",
      category: "Government and Democracy",
    },
  ];
}
