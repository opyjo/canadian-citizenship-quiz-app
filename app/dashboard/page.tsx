"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuizAttempts } from "@/hooks/useQuizAttempts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BarChart2, Award, BookOpen } from "lucide-react";
import { useAuthStore } from "@/stores/auth/authStore";
import { QuizHistoryTable } from "@/components/quiz/QuizHistoryTable";
import { calculateQuizStats } from "@/app/utils/helpers";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const authIsLoading = useAuthStore((state) => state.isLoading);

  const {
    data: quizAttempts = [],
    isLoading: attemptsIsLoading,
    error: quizError,
  } = useQuizAttempts(user?.id ?? null);

  if (quizError) throw quizError;

  // ============================================================================
  // Setting up the loading state
  // ============================================================================
  const isLoading = authIsLoading || attemptsIsLoading;
  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { totalQuizzes, averageScore, bestScore } =
    calculateQuizStats(quizAttempts);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your progress and quiz history
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-3xl font-bold">{totalQuizzes}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart2 className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-3xl font-bold">{averageScore}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Best Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Award className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-3xl font-bold">{bestScore}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quiz History</CardTitle>
            <CardDescription>
              View your past quiz attempts and results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {quizAttempts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  You haven't taken any quizzes yet.
                </p>
                <div className="mt-4">
                  <Link href="/practice">
                    <Button>Take Your First Quiz</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Quizzes</TabsTrigger>
                  <TabsTrigger value="standard">Standard</TabsTrigger>
                  <TabsTrigger value="timed">Timed</TabsTrigger>
                  <TabsTrigger value="practice">Practice</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <QuizHistoryTable attempts={quizAttempts} groupByType />
                </TabsContent>

                <TabsContent value="standard">
                  <QuizHistoryTable
                    attempts={quizAttempts.filter(
                      (attempt) => attempt.quiz_type === "standard"
                    )}
                  />
                </TabsContent>

                <TabsContent value="timed">
                  <QuizHistoryTable
                    attempts={quizAttempts.filter(
                      (attempt) => attempt.quiz_type === "timed"
                    )}
                  />
                </TabsContent>

                <TabsContent value="practice">
                  <QuizHistoryTable
                    attempts={quizAttempts.filter(
                      (attempt) => attempt.is_practice
                    )}
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/">
              <Button variant="outline">Return Home</Button>
            </Link>
            <Link href="/practice">
              <Button>Practice Mode</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
