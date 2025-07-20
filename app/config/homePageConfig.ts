import {
  BookOpen,
  Users,
  Building,
  Map,
  DollarSign,
  Flag,
  UserCheck,
  Timer,
  FileText,
  Target,
  Award,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export const chapters = [
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
    description: "Important Canadians you should know for the citizenship test",
    href: "/study/notable-names",
    icon: UserCheck,
    color: "bg-indigo-50 border-indigo-200",
  },
];

export const quizTypes = [
  {
    title: "Standard Quiz",
    description:
      "Take your time to answer questions at your own pace. Perfect for learning and reviewing concepts.",
    icon: FileText,
    mode: "standard",
    path: "/quiz",
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
    mode: "timed",
    path: "/quiz/timed",
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

export const features = [
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
    icon: Award,
    title: "Track Your Progress",
    description:
      "Monitor your learning progress and identify areas that need more attention",
  },
];

export const stats = [
  { number: "95%", label: "Pass Rate", icon: TrendingUp },
  { number: "1,000+", label: "Practice Questions", icon: Target },
  { number: "7", label: "Study Chapters", icon: BookOpen },
  { number: "24/7", label: "AI Assistance", icon: Sparkles },
];

export const testimonials = [
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
