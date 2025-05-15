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

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Canadian Citizenship Test Quiz
          </h1>
          <p className="text-xl text-muted-foreground">
            Test your knowledge of Canadian history, government, and culture
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Standard Quiz</CardTitle>
              <CardDescription>
                Take a standard quiz with 20 random questions from all
                categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-medium">20</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Questions per quiz</p>
                    <p className="text-sm text-muted-foreground">
                      Each quiz contains 20 randomly selected questions
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-medium">∞</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">No time limit</p>
                    <p className="text-sm text-muted-foreground">
                      Take your time to answer each question carefully
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/quiz" className="w-full">
                <Button className="w-full" size="lg">
                  Start Standard Quiz
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Timed Quiz</CardTitle>
              <CardDescription>
                Challenge yourself with a timed quiz to simulate real test
                conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-medium">20</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Questions per quiz</p>
                    <p className="text-sm text-muted-foreground">
                      Each quiz contains 20 randomly selected questions
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-medium">30</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">30 minute time limit</p>
                    <p className="text-sm text-muted-foreground">
                      Similar to the real citizenship test conditions
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/quiz/timed" className="w-full">
                <Button className="w-full" size="lg">
                  Start Timed Quiz
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Practice Mode</CardTitle>
            <CardDescription>
              Sharpen your knowledge by focusing on areas that need improvement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-1">
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-medium">✍️</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Practice Incorrect Questions</p>
                  <p className="text-sm text-muted-foreground">
                    Focus on questions you've previously answered incorrectly
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Link href="/practice" className="w-full">
              <Button className="w-full" size="lg" variant="outline">
                Go to Practice Mode
              </Button>
            </Link>

            <div className="text-center w-full">
              <p className="text-sm text-muted-foreground mb-2">
                Create an account to track your progress and quiz history
              </p>
              <div className="flex gap-2 justify-center">
                <Link href="/auth">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
