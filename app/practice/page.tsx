"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, BookOpen, AlertTriangle } from "lucide-react"

interface Category {
  name: string
  count: number
}

export default function PracticePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [incorrectQuestionsCount, setIncorrectQuestionsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        // Check if user is authenticated
        const { data: userData } = await supabase.auth.getUser()
        setUser(userData.user)

        // Fetch categories and question counts
        const { data: categoryData, error: categoryError } = await supabase
          .from("questions")
          .select("category")
          .not("category", "is", null)

        if (categoryError) throw categoryError

        // Count questions by category
        const categoryCounts: Record<string, number> = {}
        categoryData?.forEach((item) => {
          if (item.category) {
            categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1
          }
        })

        const formattedCategories = Object.entries(categoryCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name))

        setCategories(formattedCategories)

        // If user is logged in, fetch incorrect questions count
        if (userData.user) {
          const { data: incorrectData, error: incorrectError } = await supabase
            .from("user_incorrect_questions")
            .select("*", { count: "exact" })
            .eq("user_id", userData.user.id)

          if (incorrectError) throw incorrectError

          setIncorrectQuestionsCount(incorrectData?.length || 0)
        }
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message || "Failed to load practice data")

        // For demo purposes, set sample categories
        setCategories([
          { name: "Canadian History", count: 120 },
          { name: "Government and Democracy", count: 95 },
          { name: "Geography", count: 65 },
          { name: "Rights and Responsibilities", count: 50 },
          { name: "Indigenous Peoples", count: 30 },
          { name: "Canadian Symbols and Identity", count: 40 },
          { name: "General Knowledge", count: 14 },
        ])
        setIncorrectQuestionsCount(12)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const startPracticeByCategory = (category: string) => {
    router.push(`/quiz/practice?category=${encodeURIComponent(category)}`)
  }

  const startPracticeIncorrect = () => {
    router.push("/quiz/practice?incorrect=true")
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-lg">Loading practice options...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Practice Mode</h1>
          <p className="text-muted-foreground">Focus on specific topics or questions you've answered incorrectly</p>
        </div>

        <Tabs defaultValue="categories">
          <TabsList className="mb-4">
            <TabsTrigger value="categories">Practice by Category</TabsTrigger>
            <TabsTrigger value="incorrect">Practice Incorrect Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.name} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.count} questions available</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-red-600" />
                      <span>Focus on {category.name.toLowerCase()} topics</span>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t">
                    <Button className="w-full" onClick={() => startPracticeByCategory(category.name)}>
                      Start Practice
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="incorrect" className="space-y-6">
            {!user ? (
              <Card>
                <CardHeader>
                  <CardTitle>Sign In Required</CardTitle>
                  <CardDescription>
                    You need to sign in to track and practice questions you've answered incorrectly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                    <p>This feature requires an account to track your quiz history</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/auth" className="w-full">
                    <Button className="w-full">Sign In or Create Account</Button>
                  </Link>
                </CardFooter>
              </Card>
            ) : incorrectQuestionsCount === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Incorrect Questions</CardTitle>
                  <CardDescription>
                    You haven't answered any questions incorrectly yet, or you haven't taken any quizzes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 text-green-600">
                    <BookOpen className="h-5 w-5" />
                    <p>Take some quizzes first to build your practice list</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/" className="w-full">
                    <Button className="w-full">Take a Quiz</Button>
                  </Link>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Practice Incorrect Questions</CardTitle>
                  <CardDescription>
                    Focus on the {incorrectQuestionsCount} questions you've previously answered incorrectly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <p>Practicing these questions will help improve your score</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={startPracticeIncorrect}>
                    Start Practice
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-center">
          <Link href="/">
            <Button variant="outline">Return Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
