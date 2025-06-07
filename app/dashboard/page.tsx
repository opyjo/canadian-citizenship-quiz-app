"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import supabaseClient from "@/lib/supabase-client";
import { useQuizAttempts } from "@/lib/hooks/useQuizAttempts";
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

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();
  const supabase = supabaseClient;

  // Get user authentication state
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          router.push("/auth");
          return;
        }
        setUser(userData.user);
      } catch (err) {
        console.error("Error checking auth status:", err);
        router.push("/auth");
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  // Use TanStack Query for quiz attempts
  const {
    data: quizAttempts = [],
    isLoading: quizLoading,
    error: quizError,
  } = useQuizAttempts(user?.id ?? "");

  const loading = authLoading || quizLoading;
  const error = quizError?.message;

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Loading dashboard...</p>
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

  // Calculate statistics with null safety
  const totalQuizzes = quizAttempts.length;
  const validAttempts = quizAttempts.filter(
    (attempt) =>
      attempt.score !== null && attempt.total_questions_in_attempt !== null
  );

  const averageScore =
    validAttempts.length > 0
      ? Math.round(
          (validAttempts.reduce(
            (sum, attempt) =>
              sum +
              (attempt.score! / attempt.total_questions_in_attempt!) * 100,
            0
          ) /
            validAttempts.length) *
            10
        ) / 10
      : 0;

  const bestScore =
    validAttempts.length > 0
      ? Math.round(
          Math.max(
            ...validAttempts.map(
              (attempt) =>
                (attempt.score! / attempt.total_questions_in_attempt!) * 100
            )
          ) * 10
        ) / 10
      : 0;

  return (
    <div className="container py-8 px-4">
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
                  <Link href="/">
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

                <TabsContent value="all" className="space-y-4">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b text-xs sm:text-sm">
                      <div>Date</div>
                      <div>Type</div>
                      <div>Score</div>
                      <div>Time Taken</div>
                    </div>
                    <div className="divide-y">
                      {quizAttempts.map((attempt) => (
                        <div
                          key={attempt.id}
                          className="grid grid-cols-4 gap-4 p-4 text-xs sm:text-sm"
                        >
                          <div>
                            {attempt.created_at
                              ? new Date(
                                  attempt.created_at
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                          <div className="capitalize">
                            {attempt.quiz_type ?? "Unknown"}
                          </div>
                          <div>
                            {attempt.score !== null &&
                            attempt.total_questions_in_attempt !== null
                              ? `${attempt.score}/${
                                  attempt.total_questions_in_attempt
                                } (${Math.round(
                                  (attempt.score /
                                    attempt.total_questions_in_attempt) *
                                    100
                                )}%)`
                              : "N/A"}
                          </div>
                          <div>
                            {attempt.time_taken_seconds
                              ? `${Math.floor(
                                  attempt.time_taken_seconds / 60
                                )}m ${attempt.time_taken_seconds % 60}s`
                              : "N/A"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="standard" className="space-y-4">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b text-xs sm:text-sm">
                      <div>Date</div>
                      <div>Type</div>
                      <div>Score</div>
                      <div>Time Taken</div>
                    </div>
                    <div className="divide-y">
                      {quizAttempts
                        .filter((attempt) => attempt.quiz_type === "standard")
                        .map((attempt) => (
                          <div
                            key={attempt.id}
                            className="grid grid-cols-4 gap-4 p-4 text-xs sm:text-sm"
                          >
                            <div>
                              {attempt.created_at
                                ? new Date(
                                    attempt.created_at
                                  ).toLocaleDateString()
                                : "N/A"}
                            </div>
                            <div className="capitalize">
                              {attempt.quiz_type ?? "Unknown"}
                            </div>
                            <div>
                              {attempt.score !== null &&
                              attempt.total_questions_in_attempt !== null
                                ? `${attempt.score}/${
                                    attempt.total_questions_in_attempt
                                  } (${Math.round(
                                    (attempt.score /
                                      attempt.total_questions_in_attempt) *
                                      100
                                  )}%)`
                                : "N/A"}
                            </div>
                            <div>
                              {attempt.time_taken_seconds
                                ? `${Math.floor(
                                    attempt.time_taken_seconds / 60
                                  )}m ${attempt.time_taken_seconds % 60}s`
                                : "N/A"}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timed" className="space-y-4">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b text-xs sm:text-sm">
                      <div>Date</div>
                      <div>Type</div>
                      <div>Score</div>
                      <div>Time Taken</div>
                    </div>
                    <div className="divide-y">
                      {quizAttempts
                        .filter((attempt) => attempt.quiz_type === "timed")
                        .map((attempt) => (
                          <div
                            key={attempt.id}
                            className="grid grid-cols-4 gap-4 p-4 text-xs sm:text-sm"
                          >
                            <div>
                              {attempt.created_at
                                ? new Date(
                                    attempt.created_at
                                  ).toLocaleDateString()
                                : "N/A"}
                            </div>
                            <div className="capitalize">
                              {attempt.quiz_type ?? "Unknown"}
                            </div>
                            <div>
                              {attempt.score !== null &&
                              attempt.total_questions_in_attempt !== null
                                ? `${attempt.score}/${
                                    attempt.total_questions_in_attempt
                                  } (${Math.round(
                                    (attempt.score /
                                      attempt.total_questions_in_attempt) *
                                      100
                                  )}%)`
                                : "N/A"}
                            </div>
                            <div>
                              {attempt.time_taken_seconds
                                ? `${Math.floor(
                                    attempt.time_taken_seconds / 60
                                  )}m ${attempt.time_taken_seconds % 60}s`
                                : "N/A"}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="practice" className="space-y-4">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b text-xs sm:text-sm">
                      <div>Date</div>
                      <div>Type</div>
                      <div>Score</div>
                      <div>Time Taken</div>
                    </div>
                    <div className="divide-y">
                      {quizAttempts
                        .filter((attempt) =>
                          attempt.quiz_type?.startsWith("practice")
                        )
                        .map((attempt) => (
                          <div
                            key={attempt.id}
                            className="grid grid-cols-4 gap-4 p-4 text-xs sm:text-sm"
                          >
                            <div>
                              {attempt.created_at
                                ? new Date(
                                    attempt.created_at
                                  ).toLocaleDateString()
                                : "N/A"}
                            </div>
                            <div className="capitalize">
                              {attempt.quiz_type ?? "Unknown"}
                            </div>
                            <div>
                              {attempt.score !== null &&
                              attempt.total_questions_in_attempt !== null
                                ? `${attempt.score}/${
                                    attempt.total_questions_in_attempt
                                  } (${Math.round(
                                    (attempt.score /
                                      attempt.total_questions_in_attempt) *
                                      100
                                  )}%)`
                                : "N/A"}
                            </div>
                            <div>
                              {attempt.time_taken_seconds
                                ? `${Math.floor(
                                    attempt.time_taken_seconds / 60
                                  )}m ${attempt.time_taken_seconds % 60}s`
                                : "N/A"}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
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
