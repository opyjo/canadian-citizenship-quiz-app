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
  BookOpen,
  Users,
  Building,
  Map,
  DollarSign,
  Flag,
  UserCheck,
  Clock,
  Target,
  Award,
  TrendingUp,
  Star,
  Shield,
  Timer,
  FileText,
} from "lucide-react";

export default function HomePage() {
  const chapters = [
    {
      title: "Canadian History",
      description:
        "Learn about Canada's rich history from Aboriginal peoples to modern times",
      href: "/study/canadian-history",
      icon: BookOpen,
      color: "bg-red-50 border-red-200",
    },
    {
      title: "Rights & Responsibilities",
      description:
        "Understand your rights and responsibilities as a Canadian citizen",
      href: "/study/rights-responsibilities",
      icon: Users,
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "Government Structure",
      description:
        "Explore how Canadians govern themselves and the democratic process",
      href: "/study/government-structure",
      icon: Building,
      color: "bg-green-50 border-green-200",
    },
    {
      title: "Geography",
      description: "Discover Canada's regions, provinces, and territories",
      href: "/study/geography",
      icon: Map,
      color: "bg-yellow-50 border-yellow-200",
    },
    {
      title: "Economy",
      description: "Learn about Canada's economy and trading relationships",
      href: "/study/economy",
      icon: DollarSign,
      color: "bg-purple-50 border-purple-200",
    },
    {
      title: "Symbols",
      description:
        "Understand Canadian symbols, traditions, and cultural heritage",
      href: "/study/symbols",
      icon: Flag,
      color: "bg-orange-50 border-orange-200",
    },
    {
      title: "Notable Names",
      description:
        "Important Canadians you should know for the citizenship test",
      href: "/study/notable-names",
      icon: UserCheck,
      color: "bg-indigo-50 border-indigo-200",
    },
  ];

  const quizTypes = [
    {
      title: "Standard Quiz",
      description:
        "Take your time to answer questions at your own pace. Perfect for learning and reviewing concepts.",
      icon: FileText,
      href: "/quiz/standard",
      features: [
        "No time limit",
        "Immediate feedback",
        "Review answers",
        "Perfect for learning",
      ],
      color: "bg-blue-50 border-blue-200",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Timed Quiz",
      description:
        "Simulate the real citizenship test with 20 questions in 30 minutes. Test your readiness!",
      icon: Timer,
      href: "/quiz/timed",
      features: [
        "30-minute time limit",
        "20 questions",
        "Real test simulation",
        "Final score only",
      ],
      color: "bg-red-50 border-red-200",
      buttonColor: "bg-red-600 hover:bg-red-700",
    },
  ];

  const features = [
    {
      icon: BookOpen,
      title: "Comprehensive Study Materials",
      description:
        "Study materials covering all the key topics you need to know for the citizenship test",
    },
    {
      icon: Target,
      title: "Comprehensive Test Prep",
      description:
        "Practice questions covering all test topics: history, geography, government, rights, and responsibilities",
    },
    {
      icon: Clock,
      title: "Flexible Learning",
      description:
        "Study at your own pace with mobile-friendly content accessible anywhere, anytime",
    },
    {
      icon: Award,
      title: "Track Your Progress",
      description:
        "Monitor your learning progress and identify areas that need more attention",
    },
    {
      icon: Users,
      title: "Community Support",
      description:
        "Join thousands of aspiring Canadians on their citizenship journey",
    },
    {
      icon: Shield,
      title: "Free & Accessible",
      description:
        "Complete access to all study materials and practice tests at no cost",
    },
  ];

  const stats = [
    { number: "50,000+", label: "Students Helped", icon: Users },
    { number: "95%", label: "Pass Rate", icon: TrendingUp },
    { number: "1,000+", label: "Practice Questions", icon: Target },
    { number: "7", label: "Study Chapters", icon: BookOpen },
  ];

  const testimonials = [
    {
      name: "Maria Rodriguez",
      country: "Originally from Mexico",
      text: "This study guide helped me pass my citizenship test on the first try! The content is comprehensive and easy to understand.",
      rating: 5,
    },
    {
      name: "Ahmed Hassan",
      country: "Originally from Egypt",
      text: "Excellent resource for learning about Canadian history and government. The practice questions were very similar to the actual test.",
      rating: 5,
    },
    {
      name: "Li Wei",
      country: "Originally from China",
      text: "I studied for 3 weeks using this guide and felt completely prepared. Highly recommend to anyone taking the citizenship test.",
      rating: 5,
    },
  ];

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
              <span className="text-red-600">Confidence</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Comprehensive study guide to help you prepare for the citizenship
              test. Everything you need to study for your citizenship exam in
              one convenient resource.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/quiz">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-lg px-8 py-4"
                >
                  Start Studying Now
                </Button>
              </Link>
              <Link href="/quiz/timed">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4"
                >
                  Take Timed Quiz
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      <IconComponent className="h-8 w-8 text-red-600" />
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
                    <Link
                      href={
                        quiz.href === "/quiz/standard" ? "/quiz" : quiz.href
                      }
                      className="block"
                    >
                      <Button
                        className={`w-full ${quiz.buttonColor} text-white text-lg py-3`}
                      >
                        Start {quiz.title}
                      </Button>
                    </Link>
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
              <Link href="/quiz">
                <Button
                  size="lg"
                  className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-4"
                >
                  Start Studying Now
                </Button>
              </Link>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href="/quiz">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-red-600 text-lg px-6 py-4"
                  >
                    Standard Quiz
                  </Button>
                </Link>
                <Link href="/quiz/timed">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-red-600 text-lg px-6 py-4"
                  >
                    Timed Quiz
                  </Button>
                </Link>
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
    </>
  );
}
