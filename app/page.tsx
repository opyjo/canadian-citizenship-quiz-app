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
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 via-white to-blue-50 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-red-100 text-red-800">
              📚 Independent Study Guide
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Prepare for Your Citizenship Test with
              <span className="text-red-600"> Confidence</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Comprehensive study guide to help you prepare for the citizenship
              test. Everything you need to study for your citizenship exam in
              one convenient resource.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleStartQuiz("standard", "/quiz")}
                >
                  Standard Quiz
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-red-600 text-red-600 hover:bg-red-50"
                  onClick={() => handleStartQuiz("timed", "/quiz/timed")}
                >
                  Timed Quiz
                </Button>
              </div>
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link href="/ask-ai">
                  <Sparkles className="mr-2 h-5 w-5" /> Ask AI Assistant
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-green-600 text-green-600 hover:bg-green-50"
              >
                <Link href="/map">
                  <Map className="mr-2 h-5 w-5" /> Explore Canada Map
                </Link>
              </Button>
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
                onClick={() => handleStartQuiz("practice", "/practice")}
              >
                Practice Mode
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => router.push("/study-guide")}
              >
                View Study Guide
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center">
                      <IconComponent className="text-red-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Types Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Practice with Our Quiz System
            </h2>
            <p className="text-xl text-gray-600">
              Choose between our Standard Quiz for learning or Timed Quiz to
              simulate the real citizenship test
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {quizTypes.map((quiz, index) => {
              const IconComponent = quiz.icon;
              return (
                <Card
                  key={index}
                  className={`${quiz.color} hover:shadow-xl transition-shadow border-2`}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-4 bg-white rounded-full w-fit shadow-sm">
                      <IconComponent className="h-10 w-10 text-gray-700" />
                    </div>
                    <CardTitle className="text-2xl mb-2">
                      {quiz.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      {quiz.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {quiz.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      className={`w-full ${quiz.buttonColor} text-white text-lg py-3`}
                      onClick={() => handleStartQuiz(quiz.mode, quiz.path)}
                    >
                      Start {quiz.title}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Not sure which quiz to take? Start with the Standard Quiz to
              learn, then test yourself with the Timed Quiz!
            </p>
            <Link href="/faq">
              <Button
                variant="outline"
                className="text-gray-600 hover:text-red-600"
              >
                Learn More About the Test Format
              </Button>
            </Link>
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
