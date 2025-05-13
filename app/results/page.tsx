"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase-client"
import { CheckCircle, XCircle, AlertCircle, Clock, Info } from "lucide-react"

interface Question {
  id: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  answer_explanation: string | null
  category: string | null
}

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [questions, setQuestions] = useState<Question[]>([])
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTimed, setIsTimed] = useState(false)
  const [timeTaken, setTimeTaken] = useState<number | null>(null)
  const [isPractice, setIsPractice] = useState(false)
  const [practiceType, setPracticeType] = useState<string | null>(null)
  const [category, setCategory] = useState<string | null>(null)

  useEffect(() => {
    async function loadResults() {
      try {
        // Get user answers from URL params
        const answersParam = searchParams.get("answers")
        if (!answersParam) {
          router.push("/")
          return
        }

        const parsedAnswers = JSON.parse(decodeURIComponent(answersParam))
        setUserAnswers(parsedAnswers)

        // Check if this was a timed quiz
        const timedParam = searchParams.get("timed")
        setIsTimed(timedParam === "true")

        // Get time taken if available
        const timeTakenParam = searchParams.get("timeTaken")
        if (timeTakenParam) {
          setTimeTaken(Number.parseInt(timeTakenParam))
        }

        // Check if this was a practice quiz
        const practiceParam = searchParams.get("practice")
        setIsPractice(practiceParam === "true")

        // Get practice type if available
        const practiceTypeParam = searchParams.get("practiceType")
        if (practiceTypeParam) {
          setPracticeType(practiceTypeParam)
        }

        // Get category if available
        const categoryParam = searchParams.get("category")
        if (categoryParam) {
          setCategory(categoryParam)
        }

        // Fetch questions from Supabase
        const supabase = createClient()

        // In a real app, we would fetch only the questions the user answered
        // For demo purposes, we'll use the sample questions
        const { data, error } = await supabase.from("questions").select("*").order("id").limit(20)

        if (error) {
          throw new Error(error.message)
        }

        if (data) {
          setQuestions(data)
        } else {
          // For demo purposes, load sample questions if Supabase is not set up
          setQuestions(getSampleQuestions())
        }
      } catch (err) {
        console.error("Error loading results:", err)
        setError("Failed to load quiz results. Please try again.")
        // For demo purposes, load sample questions if there's an error
        setQuestions(getSampleQuestions())
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [router, searchParams])

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p>Loading results...</p>
      </div>
    )
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
    )
  }

  // Calculate score
  const correctAnswers = questions.filter((q, index) => userAnswers[index] === q.correct_option).length

  const totalQuestions = questions.length
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100)
  const passed = correctAnswers >= 15 // 75% passing threshold

  // Format time taken
  const formattedTimeTaken = timeTaken ? `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s` : "Not recorded"

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-3xl w-full space-y-8">
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Quiz Results</CardTitle>
              {isPractice && (
                <div className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                  {practiceType === "category" ? category : "Incorrect Questions"} Practice
                </div>
              )}
              {isTimed && (
                <div className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Timed Quiz
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4 p-6 bg-gray-50 rounded-lg">
              <div className={`text-5xl font-bold ${passed ? "text-green-600" : "text-red-600"}`}>
                {correctAnswers} / {totalQuestions}
              </div>
              <div className="text-xl">Score: {scorePercentage}%</div>
              <div className="flex items-center space-x-2">
                {passed ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <span className="font-medium text-green-600">Passed!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-red-600" />
                    <span className="font-medium text-red-600">Failed</span>
                  </>
                )}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {passed
                  ? "Congratulations! You've passed the practice test."
                  : "You need at least 15 correct answers (75%) to pass. Try again!"}
              </p>

              {isTimed && (
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Time taken: {formattedTimeTaken}</span>
                </div>
              )}
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Questions</TabsTrigger>
                <TabsTrigger value="correct">Correct ({correctAnswers})</TabsTrigger>
                <TabsTrigger value="incorrect">Incorrect ({totalQuestions - correctAnswers})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-4">
                {questions.map((question, index) => (
                  <QuestionReview
                    key={index}
                    question={question}
                    userAnswer={userAnswers[index]}
                    questionNumber={index + 1}
                  />
                ))}
              </TabsContent>

              <TabsContent value="correct" className="space-y-4 mt-4">
                {questions
                  .filter((q, index) => userAnswers[index] === q.correct_option)
                  .map((question, index) => (
                    <QuestionReview
                      key={index}
                      question={question}
                      userAnswer={userAnswers[questions.indexOf(question)]}
                      questionNumber={questions.indexOf(question) + 1}
                    />
                  ))}
              </TabsContent>

              <TabsContent value="incorrect" className="space-y-4 mt-4">
                {questions
                  .filter((q, index) => userAnswers[index] !== q.correct_option)
                  .map((question, index) => (
                    <QuestionReview
                      key={index}
                      question={question}
                      userAnswer={userAnswers[questions.indexOf(question)]}
                      questionNumber={questions.indexOf(question) + 1}
                    />
                  ))}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/")}>
              Return Home
            </Button>
            {isPractice ? (
              <Link href="/practice">
                <Button>Back to Practice</Button>
              </Link>
            ) : isTimed ? (
              <Link href="/quiz/timed">
                <Button>Try Another Timed Quiz</Button>
              </Link>
            ) : (
              <Link href="/quiz">
                <Button>Try Again</Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function QuestionReview({
  question,
  userAnswer,
  questionNumber,
}: {
  question: Question
  userAnswer: string
  questionNumber: number
}) {
  const isCorrect = userAnswer === question.correct_option
  const [showExplanation, setShowExplanation] = useState(false)

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-2">
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
            isCorrect ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          {isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <p className="font-medium">Question {questionNumber}</p>
            {question.category && (
              <span className="text-xs text-muted-foreground px-2 py-1 bg-gray-100 rounded-full">
                {question.category}
              </span>
            )}
          </div>
          <p>{question.question_text}</p>
        </div>
      </div>

      <div className="space-y-2 pl-8">
        {["a", "b", "c", "d"].map((option) => (
          <div
            key={option}
            className={`p-3 border rounded-md ${
              option === question.correct_option
                ? "border-green-600 bg-green-50"
                : option === userAnswer && option !== question.correct_option
                  ? "border-red-600 bg-red-50"
                  : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                  option === question.correct_option
                    ? "border-green-600 bg-green-600 text-white"
                    : option === userAnswer && option !== question.correct_option
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-gray-300"
                }`}
              >
                <span className="text-sm">{option.toUpperCase()}</span>
              </div>
              <span>{question[`option_${option}` as keyof Question]}</span>

              {option === question.correct_option && option !== userAnswer && (
                <AlertCircle className="h-5 w-5 text-green-600 ml-auto" />
              )}
            </div>
          </div>
        ))}

        {question.answer_explanation && (
          <div className="mt-4">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <Info className="h-4 w-4 mr-1" />
              {showExplanation ? "Hide Explanation" : "Show Explanation"}
            </button>

            {showExplanation && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                {question.answer_explanation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Sample questions for demo purposes when Supabase is not set up
function getSampleQuestions(): Question[] {
  return [
    {
      id: 1,
      question_text: "When must a federal election be held according to legislation passed by parliament?",
      option_a: "When the king wants to replace the prime minister",
      option_b: "Within four years of the most recent election",
      option_c: "Within 5 years of the last election",
      option_d: "The prime minister can call the election any time at his own will",
      correct_option: "b",
      answer_explanation:
        "According to Canadian legislation, a federal election must be held within four years of the most recent election.",
      category: "Government and Democracy",
    },
    {
      id: 2,
      question_text: "Which of the following is the federal government responsible for?",
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
      question_text: "What was the name of the new country formed at confederation?",
      option_a: "Britain",
      option_b: "Canada",
      option_c: "Canadian Confederation",
      option_d: "Dominion of Canada",
      correct_option: "d",
      answer_explanation: "At Confederation in 1867, the country was officially named the Dominion of Canada.",
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
      option_c: "If a majority of the MPs vote against a major government decision",
      option_d: "If a minority of the MPs vote against a major government decision",
      correct_option: "c",
      answer_explanation:
        "A party in power can be defeated if a majority of the Members of Parliament (MPs) vote against a major government decision, which is known as losing a confidence vote.",
      category: "Government and Democracy",
    },
    {
      id: 8,
      question_text: "Which of the following are the responsibilities of provincial government?",
      option_a: "Education, healthcare, natural resources and policing",
      option_b: "National defense, healthcare, citizenship and firefighting",
      option_c: "Education, foreign policy, natural resources and policing",
      option_d: "National defense, foreign policy, highways and Aboriginal affairs",
      correct_option: "a",
      answer_explanation:
        "Provincial governments in Canada are responsible for education, healthcare, natural resources, and policing within their jurisdictions.",
      category: "Government and Democracy",
    },
    {
      id: 9,
      question_text: "What was the Underground Railroad?",
      option_a: "An anti-slavery network that helped thousands of slaves escape the United States and settle in Canada",
      option_b: "A railroad through the Rockies that was mainly through mountain tunnels",
      option_c: "A network fur traders used to transport beaver pelts to the United States",
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
      option_d: "To conduct or support land warfare, peacekeeping or humanitarian missions",
      correct_option: "b",
      answer_explanation: "The primary role of the police in Canada is to keep people safe and to enforce the law.",
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
      question_text: "Which province is one of the most productive agricultural regions in the world?",
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
      question_text: "Can you name the five great lakes between Canada and the US?",
      option_a: "Lake Toronto, Lake Michigan, Lake Mexico, Lake Ontario, Lake St. Louis",
      option_b: "Lake Superior, Lake Michigan, Lake Huron, Lake Erie, Lake Ontario",
      option_c: "Lake Michigan, Lake Victoria, Lake Mexico, Lake Ontario, Lake St. Louis",
      option_d: "None of the above",
      correct_option: "b",
      answer_explanation:
        "The five Great Lakes between Canada and the United States are Lake Superior, Lake Michigan, Lake Huron, Lake Erie, and Lake Ontario.",
      category: "Geography",
    },
    {
      id: 20,
      question_text: "What do you call the king's representative in the provinces?",
      option_a: "Governor lieutenant",
      option_b: "King's governor",
      option_c: "Lieutenant Governor",
      option_d: "Governor General",
      correct_option: "c",
      answer_explanation: "The king's (or queen's) representative in each province is called the Lieutenant Governor.",
      category: "Government and Democracy",
    },
  ]
}
