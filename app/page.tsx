"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Sparkles,
  BookOpen,
  ListChecks,
  Users,
  Smartphone,
  TrendingUp,
  MessageCircleQuestion,
  Map,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import supabaseClient from "@/lib/supabase-client";
import { checkAttemptLimits, type QuizMode } from "@/lib/quizLimits";
import ConfirmationModal from "@/components/confirmation-modal";
import {
  chapters,
  quizTypes,
  features,
  stats,
  testimonials,
} from "@/app/config/homePageConfig";

export default function HomePage() {
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

  const handleStartQuiz = async (quizMode: QuizMode, quizPath: string) => {
    const result = await checkAttemptLimits(quizMode, supabase);

    if (result.canAttempt) {
      router.push(quizPath);
    } else {
      let confirmText = "OK";
      let cancelText = "Cancel";
      let onConfirmAction = () =>
        setModalState({ ...modalState, isOpen: false });

      if (!result.isLoggedIn) {
        confirmText = "Sign Up";
        onConfirmAction = () => router.push("/signup");
        cancelText = "Later";
      } else if (!result.isPaidUser) {
        confirmText = "Upgrade Plan";
        onConfirmAction = () => router.push("/pricing");
        cancelText = "OK";
      }

      setModalState({
        isOpen: true,
        title: "Quiz Limit Reached",
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

  return (
    <>
      {/* Skip Link for Keyboard Users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-red-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Hero Section */}
      <section
        className="bg-gradient-to-br from-red-50 via-white to-blue-50 py-16 lg:py-24"
        aria-labelledby="hero-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-red-100 text-red-800">
              <span aria-hidden="true">📚</span> Independent Study Guide
            </Badge>
            <h1
              id="hero-heading"
              className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6"
            >
              Prepare for Your Citizenship Test with
              <span className="text-red-600"> Confidence</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Comprehensive study guide to help you prepare for the citizenship
              test. Everything you need to study for your citizenship exam in
              one convenient resource.
            </p>
            <div className="mt-12" id="main-content">
              {/* User Journey Cards */}
              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
                role="region"
                aria-labelledby="journey-heading"
              >
                <h2 id="journey-heading" className="sr-only">
                  Choose Your Learning Path
                </h2>

                {/* Quiz Path */}
                <Card className="border-2 border-red-200 hover:border-red-400 transition-colors bg-red-50/50 focus-within:ring-2 focus-within:ring-red-500 focus-within:ring-offset-2">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-3 p-3 bg-red-100 rounded-full w-fit">
                      <ListChecks
                        className="h-8 w-8 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <CardTitle className="text-xl text-red-800">
                      Test Yourself
                    </CardTitle>
                    <CardDescription className="text-red-600">
                      Ready to practice? Take our citizenship quizzes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={() => handleStartQuiz("standard", "/quiz")}
                      aria-describedby="standard-quiz-desc"
                    >
                      Standard Quiz
                    </Button>
                    <div id="standard-quiz-desc" className="sr-only">
                      Take an untimed practice quiz with instant feedback
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-red-600 text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={() => handleStartQuiz("timed", "/quiz/timed")}
                      aria-describedby="timed-quiz-desc"
                    >
                      <span aria-hidden="true">⏱️</span> Timed Quiz
                    </Button>
                    <div id="timed-quiz-desc" className="sr-only">
                      Take a 30-minute timed quiz simulating the real test
                    </div>
                  </CardContent>
                </Card>

                {/* Study Path */}
                <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors bg-blue-50/50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-3 p-3 bg-blue-100 rounded-full w-fit">
                      <BookOpen
                        className="h-8 w-8 text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                    <CardTitle className="text-xl text-blue-800">
                      Learn First
                    </CardTitle>
                    <CardDescription className="text-blue-600">
                      New to the test? Start with our comprehensive guide
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      asChild
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Link
                        href="/study-guide"
                        aria-describedby="study-guide-desc"
                      >
                        Study Guide
                      </Link>
                    </Button>
                    <div id="study-guide-desc" className="sr-only">
                      Access comprehensive study materials covering all test
                      topics
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Link href="/ask-ai" aria-describedby="ai-assistant-desc">
                        <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                        Ask AI Assistant
                      </Link>
                    </Button>
                    <div id="ai-assistant-desc" className="sr-only">
                      Get personalized help from our AI-powered study assistant
                    </div>
                  </CardContent>
                </Card>

                {/* Explore Path */}
                <Card className="border-2 border-green-200 hover:border-green-400 transition-colors bg-green-50/50 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-3 p-3 bg-green-100 rounded-full w-fit">
                      <Map
                        className="h-8 w-8 text-green-600"
                        aria-hidden="true"
                      />
                    </div>
                    <CardTitle className="text-xl text-green-800">
                      Explore Canada
                    </CardTitle>
                    <CardDescription className="text-green-600">
                      Discover Canadian culture, geography, and heritage
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      asChild
                      className="w-full bg-green-600 hover:bg-green-700 text-white focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <Link href="/map" aria-describedby="interactive-map-desc">
                        Interactive Map
                      </Link>
                    </Button>
                    <div id="interactive-map-desc" className="sr-only">
                      Explore an interactive map of Canada with cultural and
                      geographic information
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-green-600 text-green-600 hover:bg-green-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      onClick={() => handleStartQuiz("practice", "/practice")}
                      aria-describedby="practice-mode-desc"
                    >
                      <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                      Practice Mode
                    </Button>
                    <div id="practice-mode-desc" className="sr-only">
                      Practice with unlimited questions in a relaxed environment
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Stats */}
            <section
              className="grid grid-cols-2 lg:grid-cols-3 gap-6 mt-16"
              aria-labelledby="stats-heading"
            >
              <h2 id="stats-heading" className="sr-only">
                Study Guide Statistics
              </h2>
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center">
                      <IconComponent
                        className="text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div
                      className="text-3xl font-bold text-gray-900"
                      aria-label={`${stat.number} ${stat.label}`}
                    >
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </section>
          </div>
        </div>
      </section>

      {/* Quiz Types Section */}
      <section
        className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50"
        aria-labelledby="quiz-types-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-red-100 text-red-800">
              <span aria-hidden="true">🎯</span> Quiz Practice System
            </Badge>
            <h2
              id="quiz-types-heading"
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6"
            >
              Master the Citizenship Test with Targeted Practice
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Choose your learning style: Practice at your own pace or simulate
              the real test experience
            </p>

            {/* Quick Stats */}
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto"
              role="region"
              aria-label="Quiz system statistics"
            >
              <div className="text-center p-4 bg-white/70 rounded-lg">
                <div
                  className="text-2xl font-bold text-blue-600"
                  aria-label="Over 500 practice questions available"
                >
                  500+
                </div>
                <div className="text-sm text-gray-600">Practice Questions</div>
              </div>
              <div className="text-center p-4 bg-white/70 rounded-lg">
                <div
                  className="text-2xl font-bold text-green-600"
                  aria-label="85 percent success rate"
                >
                  85%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center p-4 bg-white/70 rounded-lg">
                <div
                  className="text-2xl font-bold text-purple-600"
                  aria-label="20 questions per real test"
                >
                  20
                </div>
                <div className="text-sm text-gray-600">Real Test Questions</div>
              </div>
              <div className="text-center p-4 bg-white/70 rounded-lg">
                <div
                  className="text-2xl font-bold text-orange-600"
                  aria-label="30 minute test duration"
                >
                  30min
                </div>
                <div className="text-sm text-gray-600">Test Duration</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Standard Quiz Card */}
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-white to-blue-50/30 relative overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
              {/* Background Pattern */}
              <div
                className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-30"
                aria-hidden="true"
              ></div>

              <CardHeader className="text-center pb-6 relative">
                <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit shadow-sm">
                  <BookOpen
                    className="h-12 w-12 text-blue-600"
                    aria-hidden="true"
                  />
                </div>
                <Badge
                  variant="secondary"
                  className="mb-3 bg-blue-100 text-blue-800"
                >
                  <span aria-hidden="true">👨‍🎓</span> Perfect for Learning
                </Badge>
                <CardTitle className="text-3xl mb-3 text-blue-900">
                  Standard Quiz
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Take your time to learn and understand concepts with detailed
                  explanations
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Key Features */}
                <div
                  className="space-y-4"
                  role="list"
                  aria-label="Standard quiz features"
                >
                  <div
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                    role="listitem"
                  >
                    <div
                      className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="text-white text-sm">∞</span>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-900">
                        No Time Pressure
                      </div>
                      <div className="text-sm text-blue-700">
                        Answer at your own comfortable pace
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                    role="listitem"
                  >
                    <div
                      className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="text-white text-sm">💡</span>
                    </div>
                    <div>
                      <div className="font-semibold text-green-900">
                        Instant Feedback
                      </div>
                      <div className="text-sm text-green-700">
                        Learn from detailed explanations immediately
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg"
                    role="listitem"
                  >
                    <div
                      className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="text-white text-sm">↩️</span>
                    </div>
                    <div>
                      <div className="font-semibold text-purple-900">
                        Review & Retry
                      </div>
                      <div className="text-sm text-purple-700">
                        Go back and review any question
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm font-semibold text-blue-800 mb-2">
                    <span aria-hidden="true">💪</span> Best for:
                  </div>
                  <div className="text-sm text-blue-700">
                    First-time test takers, concept learning, building
                    confidence
                  </div>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-4 shadow-lg hover:shadow-xl transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => handleStartQuiz("standard", "/quiz")}
                  aria-describedby="standard-quiz-full-desc"
                >
                  <BookOpen className="mr-2 h-5 w-5" aria-hidden="true" />
                  Start Learning Quiz
                </Button>
                <div id="standard-quiz-full-desc" className="sr-only">
                  Start the standard quiz with unlimited time, instant feedback,
                  and ability to review questions
                </div>
              </CardContent>
            </Card>

            {/* Timed Quiz Card */}
            <Card className="border-2 border-red-200 hover:border-red-400 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-white to-red-50/30 relative overflow-hidden focus-within:ring-2 focus-within:ring-red-500 focus-within:ring-offset-2">
              {/* Background Pattern */}
              <div
                className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -translate-y-16 translate-x-16 opacity-30"
                aria-hidden="true"
              ></div>

              <CardHeader className="text-center pb-6 relative">
                <div className="mx-auto mb-4 p-4 bg-red-100 rounded-full w-fit shadow-sm">
                  <TrendingUp
                    className="h-12 w-12 text-red-600"
                    aria-hidden="true"
                  />
                </div>
                <Badge
                  variant="secondary"
                  className="mb-3 bg-red-100 text-red-800"
                >
                  <span aria-hidden="true">⚡</span> Real Test Simulation
                </Badge>
                <CardTitle className="text-3xl mb-3 text-red-900">
                  Timed Quiz
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Experience the real citizenship test with time pressure and
                  authentic conditions
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Key Features */}
                <div
                  className="space-y-4"
                  role="list"
                  aria-label="Timed quiz features"
                >
                  <div
                    className="flex items-center gap-3 p-3 bg-red-50 rounded-lg"
                    role="listitem"
                  >
                    <div
                      className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="text-white text-sm">⏱️</span>
                    </div>
                    <div>
                      <div className="font-semibold text-red-900">
                        30-Minute Timer
                      </div>
                      <div className="text-sm text-red-700">
                        Matches real citizenship test conditions
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg"
                    role="listitem"
                  >
                    <div
                      className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="text-white text-sm">20</span>
                    </div>
                    <div>
                      <div className="font-semibold text-orange-900">
                        20 Questions
                      </div>
                      <div className="text-sm text-orange-700">
                        Same format as the official test
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg"
                    role="listitem"
                  >
                    <div
                      className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="text-white text-sm">🎯</span>
                    </div>
                    <div>
                      <div className="font-semibold text-yellow-900">
                        Final Score
                      </div>
                      <div className="text-sm text-yellow-700">
                        See your results at the end
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="text-sm font-semibold text-red-800 mb-2">
                    <span aria-hidden="true">🚀</span> Best for:
                  </div>
                  <div className="text-sm text-red-700">
                    Test readiness assessment, final preparation, confidence
                    building
                  </div>
                </div>

                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-4 shadow-lg hover:shadow-xl transition-all focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={() => handleStartQuiz("timed", "/quiz/timed")}
                  aria-describedby="timed-quiz-full-desc"
                >
                  <TrendingUp className="mr-2 h-5 w-5" aria-hidden="true" />
                  Start Test Simulation
                </Button>
                <div id="timed-quiz-full-desc" className="sr-only">
                  Start the timed quiz with 30-minute limit, 20 questions,
                  simulating real test conditions
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="text-center mt-16">
            <div className="max-w-2xl mx-auto mb-8 p-6 bg-white/80 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                <span aria-hidden="true">📚</span> Study Strategy Recommendation
              </h3>
              <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm list-none">
                <li className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                    aria-hidden="true"
                  >
                    1
                  </span>
                  <span className="text-gray-700">
                    Start with Standard Quiz
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                    aria-hidden="true"
                  >
                    2
                  </span>
                  <span className="text-gray-700">Study weak areas</span>
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                    aria-hidden="true"
                  >
                    3
                  </span>
                  <span className="text-gray-700">Take Timed Quiz</span>
                </li>
              </ol>
            </div>

            <nav
              className="flex flex-col sm:flex-row justify-center items-center gap-4"
              aria-label="Additional resources"
            >
              <Link href="/faq">
                <Button
                  variant="outline"
                  className="text-gray-600 hover:text-red-600 hover:border-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <MessageCircleQuestion
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                  />
                  Learn About Test Format
                </Button>
              </Link>
              <Link href="/study-guide">
                <Button
                  variant="outline"
                  className="text-blue-600 hover:text-blue-700 hover:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
                  Study Guide First
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Citizenship Study Resource?
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive and helpful resource used by thousands of people
              preparing for their citizenship test
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <IconComponent className="h-6 w-6 text-red-600" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Study Chapters Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Complete Study Curriculum
            </h2>
            <p className="text-xl text-gray-600">
              Master all aspects of Canadian citizenship with our comprehensive
              chapter-by-chapter guide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter) => {
              const IconComponent = chapter.icon;
              return (
                <Card
                  key={chapter.href}
                  className={`${chapter.color} hover:shadow-lg transition-shadow`}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-8 w-8 text-gray-700" />
                      <CardTitle className="text-xl">{chapter.title}</CardTitle>
                    </div>
                    <CardDescription className="text-gray-600">
                      {chapter.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={chapter.href}>
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                        Study Chapter
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands who have successfully passed their citizenship test
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.country}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Citizenship Process Section */}
      <section className="py-16 lg:py-24 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Canadian Citizenship Process
            </h2>
            <p className="text-xl text-gray-600">
              Understanding the steps to become a Canadian citizen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Check Eligibility</h3>
              <p className="text-gray-600">
                Ensure you meet all requirements for Canadian citizenship
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Prepare Documents</h3>
              <p className="text-gray-600">
                Gather all required documents and supporting materials
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Study & Test</h3>
              <p className="text-gray-600">
                Study with our guide and pass the citizenship test
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Citizenship Ceremony
              </h3>
              <p className="text-gray-600">
                Take the Oath of Citizenship and become a Canadian
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Official Government Resources Section */}
      <section className="py-16 lg:py-24 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 bg-blue-100 text-blue-800"
            >
              🏛️ Official Government Resources
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ready to Apply for Citizenship?
            </h2>
            <p className="text-xl text-gray-600">
              Access official Immigration, Refugees and Citizenship Canada
              (IRCC) resources to start your application process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Apply for Citizenship */}
            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">
                    Apply for Citizenship
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Get to know how to apply for Canadian citizenship and
                  eligibility requirements.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Link
                    href="https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn Requirements
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Online Application Portal */}
            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Smartphone className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">
                    Online Application Portal
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Start or continue your application for Canadian citizenship.
                </p>
                <Button
                  asChild
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Link
                    href="https://citapply-citdemande.apps.cic.gc.ca/en/landing"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Start Application
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Application Tracker */}
            <Card className="border-orange-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">Application Tracker</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Check your application status and important updates on the
                  IRCC website.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  <Link
                    href="https://tracker-suivi.apps.cic.gc.ca/en/login"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Track Application
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Eligibility Checker */}
            <Card className="border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ListChecks className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Eligibility Checker</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Check if you are eligible to apply for Canadian citizenship.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  <Link
                    href="https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/check-eligibility.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Check Eligibility
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="border-red-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <MessageCircleQuestion className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">Contact Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Contact IRCC for any inquiries, updates, or changes to your
                  application.
                </p>
                <div className="space-y-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-red-600 text-red-600 hover:bg-red-50 text-sm"
                  >
                    <Link
                      href="https://secure.cic.gc.ca/ClientContact/en/Application"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Web Form
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-red-600 text-red-600 hover:bg-red-50 text-sm"
                  >
                    <Link href="tel:+18882422100">📞 1-888-242-2100</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer Card */}
            <Card className="border-gray-200 bg-gray-50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-700">
                    Important Note
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed">
                  These are official Government of Canada resources. Our study
                  guide is an independent resource to help you prepare for the
                  citizenship test.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-red-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Become a Canadian Citizen?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start your journey today with our comprehensive study guide and
              practice with our quiz system
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-4"
                onClick={() => router.push("/study-guide")}
              >
                Start Studying Now
              </Button>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-4"
                  onClick={() => handleStartQuiz("standard", "/quiz")}
                >
                  Standard Quiz
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-4"
                  onClick={() => handleStartQuiz("timed", "/quiz/timed")}
                >
                  Timed Quiz
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
                  onClick={() => handleStartQuiz("practice", "/practice")}
                >
                  Practice Mode
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
              About This Citizenship Study Resource
            </h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p>
                Our comprehensive citizenship study guide helps you prepare for
                the citizenship test by covering all the essential topics you
                need to know. This independent resource covers Canada's history,
                geography, economy, government, laws, and symbols to help you
                succeed on your test.
              </p>
              <p>
                The citizenship test is an important step in your journey to
                becoming a citizen. Our study materials help you learn about
                Canada's founding peoples, Confederation, and modern Canada
                through comprehensive chapters that provide the knowledge you
                need for the exam.
              </p>
              <p>
                We believe that preparing for citizenship is an important
                milestone. Our free study guide helps ensure you're
                well-prepared for the test and your journey toward citizenship.
              </p>
            </div>
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Disclaimer:</strong> This is an independent study
                resource and is not affiliated with or endorsed by the
                Government of Canada, Immigration, Refugees and Citizenship
                Canada (IRCC), or any government agency. Please refer to
                official government sources for the most current information
                about citizenship requirements and procedures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
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
    </>
  );
}
