"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  Bot,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import supabaseClient from "@/lib/supabase-client";
import { checkAttemptLimitsWithAuth } from "@/lib/quizlimits/helpers";
import ConfirmationModal from "@/components/confirmation-modal";
import {
  chapters,
  features,
  stats,
  testimonials,
} from "@/app/config/homePageConfig";
import { useAuth } from "@/context/AuthContext";
import { QuizMode } from "@/lib/quizlimits/constants";

export default function HomePage() {
  const router = useRouter();
  const supabase = supabaseClient;
  const { user } = useAuth();

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
    const result = await checkAttemptLimitsWithAuth(user, quizMode, supabase);

    if (result.canAttempt) {
      router.push(quizPath);
    } else {
      setModalState({
        isOpen: true,
        title: "Quiz Limit Reached",
        message: result.message,
        confirmText: result.isLoggedIn ? "Upgrade Plan" : "Sign Up",
        cancelText: result.isLoggedIn ? "OK" : "Later",
        onConfirm: () => {
          router.push(result.isLoggedIn ? "/pricing" : "/signup");
          setModalState((prev) => ({ ...prev, isOpen: false }));
        },
        onClose: () => setModalState((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  return (
    <>
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
              Prepare for Your Citizenship Test with{" "}
              <span className="text-red-600">Confidence</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Master your citizenship journey with our complete 3-step system:{" "}
              <strong>Study comprehensive materials</strong>,{" "}
              <strong>practice unlimited questions</strong>, and{" "}
              <strong>test yourself with realistic simulations</strong>.
              Everything you need to pass your citizenship exam.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col gap-6 mb-8">
              {/* Main Learning Actions */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  asChild
                >
                  <Link
                    href="/study-guide"
                    aria-describedby="study-guide-description"
                  >
                    Start Studying Now
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  asChild
                >
                  <Link
                    href="/practice"
                    aria-describedby="practice-mode-description"
                  >
                    Practice Mode
                  </Link>
                </Button>
              </div>

              {/* Quiz Options */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                <span className="text-gray-600 font-medium text-sm">
                  Ready to test? →
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-6 py-2 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    onClick={() => handleStartQuiz("standard", "/quiz")}
                  >
                    <ListChecks className="mr-2 h-4 w-4" aria-hidden="true" />
                    Standard Quiz
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-6 py-2 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    onClick={() => handleStartQuiz("timed", "/quiz/timed")}
                  >
                    <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
                    Timed Quiz
                  </Button>
                </div>
              </div>
            </div>

            {/* AI Assistant Introduction */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-4 py-2 text-sm text-purple-700">
                <Bot className="h-4 w-4" />
                <span>
                  💡 <strong>New:</strong> Get instant help with our AI
                  assistant - look for the purple button!
                </span>
              </div>
            </div>

            {/* Stats */}
            <section
              className="grid grid-cols-2 lg:grid-cols-3 gap-6"
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

      {/* Prominent Study & Practice Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-blue-100/30 bg-opacity-20 bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge
                variant="secondary"
                className="mb-6 bg-blue-100 text-blue-800 border-blue-200 text-lg px-6 py-2"
              >
                <span aria-hidden="true">🎓</span> Core Learning Features
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
                Master Your Citizenship Journey
              </h2>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto">
                Three powerful ways to prepare: comprehensive study materials,
                unlimited practice questions, and realistic test simulations
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Study Guide Feature */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-600 rounded-full shadow-lg">
                      <BookOpen
                        className="h-8 w-8 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <Badge
                        variant="secondary"
                        className="mb-1 bg-blue-100 text-blue-800 text-xs"
                      >
                        <span aria-hidden="true">📖</span> Step 1
                      </Badge>
                      <h3 className="text-2xl font-bold text-blue-900">
                        Study Guide
                      </h3>
                    </div>
                  </div>

                  <p className="text-blue-800 mb-6 leading-relaxed">
                    Complete curriculum covering Canadian history, geography,
                    government, laws, and cultural heritage.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="text-center p-3 bg-white/70 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        15+
                      </div>
                      <div className="text-xs text-blue-700">Chapters</div>
                    </div>
                    <div className="text-center p-3 bg-white/70 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        100%
                      </div>
                      <div className="text-xs text-green-700">Coverage</div>
                    </div>
                  </div>

                  <Button
                    asChild
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 shadow-lg hover:shadow-xl transition-all focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Link href="/study-guide">
                      <BookOpen className="mr-2 h-5 w-5" aria-hidden="true" />
                      Start Studying
                    </Link>
                  </Button>
                </div>
              </Card>

              {/* Practice Mode Feature */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-600 rounded-full shadow-lg">
                      <Users
                        className="h-8 w-8 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <Badge
                        variant="secondary"
                        className="mb-1 bg-green-100 text-green-800 text-xs"
                      >
                        <span aria-hidden="true">🎯</span> Step 2
                      </Badge>
                      <h3 className="text-2xl font-bold text-green-900">
                        Practice Mode
                      </h3>
                    </div>
                  </div>

                  <p className="text-green-800 mb-6 leading-relaxed">
                    Practice with unlimited questions in a pressure-free
                    environment to build confidence.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="text-center p-3 bg-white/70 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">∞</div>
                      <div className="text-xs text-green-700">Questions</div>
                    </div>
                    <div className="text-center p-3 bg-white/70 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        0
                      </div>
                      <div className="text-xs text-purple-700">Pressure</div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 shadow-lg hover:shadow-xl transition-all focus:ring-4 focus:ring-green-500 focus:ring-offset-2"
                    onClick={() => handleStartQuiz("practice", "/practice")}
                  >
                    <Users className="mr-2 h-5 w-5" aria-hidden="true" />
                    Start Practicing
                  </Button>
                </div>
              </Card>

              {/* Quiz Simulations Feature */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-600 rounded-full shadow-lg">
                      <TrendingUp
                        className="h-8 w-8 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <Badge
                        variant="secondary"
                        className="mb-1 bg-red-100 text-red-800 text-xs"
                      >
                        <span aria-hidden="true">⚡</span> Step 3
                      </Badge>
                      <h3 className="text-2xl font-bold text-red-900">
                        Quiz Simulations
                      </h3>
                    </div>
                  </div>

                  <p className="text-red-800 mb-6 leading-relaxed">
                    Test your knowledge with realistic citizenship test
                    simulations and timed challenges.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="text-center p-3 bg-white/70 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">20</div>
                      <div className="text-xs text-red-700">Questions</div>
                    </div>
                    <div className="text-center p-3 bg-white/70 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        30
                      </div>
                      <div className="text-xs text-orange-700">Minutes</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 shadow-lg hover:shadow-xl transition-all focus:ring-4 focus:ring-red-500 focus:ring-offset-2"
                      onClick={() => handleStartQuiz("standard", "/quiz")}
                    >
                      <ListChecks className="mr-2 h-4 w-4" aria-hidden="true" />
                      Standard Quiz
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-red-600 text-red-600 hover:bg-red-50 py-3 focus:ring-4 focus:ring-red-500 focus:ring-offset-2"
                      onClick={() => handleStartQuiz("timed", "/quiz/timed")}
                    >
                      <span aria-hidden="true">⏱️</span> Timed Quiz
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Access Bar */}
            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-6 bg-white/80 backdrop-blur-md rounded-full px-8 py-4 border border-gray-200 shadow-lg">
                <span className="text-gray-700 font-semibold">
                  Quick Start:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all"
                  asChild
                >
                  <Link href="/study-guide">Study Guide</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100 hover:text-green-700 transition-all"
                  onClick={() => handleStartQuiz("practice", "/practice")}
                >
                  Practice
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all"
                  onClick={() => handleStartQuiz("standard", "/quiz")}
                >
                  Quiz
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Journey Cards */}
      <section
        className="py-16 lg:py-24 bg-gray-50"
        aria-labelledby="journey-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2
              id="journey-heading"
              className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
            >
              Additional Learning Resources
            </h2>
            <p className="text-xl text-gray-600">
              Explore more ways to prepare and test your knowledge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* AI Assistant Path */}
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3 p-3 bg-blue-100 rounded-full w-fit">
                  <Sparkles
                    className="h-8 w-8 text-blue-600"
                    aria-hidden="true"
                  />
                </div>
                <CardTitle className="text-xl text-blue-800">
                  AI Assistant
                </CardTitle>
                <CardDescription className="text-blue-600">
                  Get personalized help and answers to your questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
            <Card className="border-2 border-green-200 hover:border-green-400 transition-colors bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3 p-3 bg-green-100 rounded-full w-fit">
                  <Map className="h-8 w-8 text-green-600" aria-hidden="true" />
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
              </CardContent>
            </Card>
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
            : setModalState((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </>
  );
}
