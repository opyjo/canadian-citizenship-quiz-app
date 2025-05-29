import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Building,
  Map,
  DollarSign,
  Flag,
  UserCheck,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Canada Study Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The Rights and Responsibilities of Citizenship
          </p>
          <div className="mt-6 p-6 bg-white rounded-lg shadow-sm border border-red-200 max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              The Oath of Citizenship
            </h2>
            <p className="text-sm text-gray-700 italic">
              "I swear (or affirm) that I will be faithful and bear true
              allegiance to Her Majesty Queen Elizabeth the Second, Queen of
              Canada, Her Heirs and Successors, and that I will faithfully
              observe the laws of Canada, including the Constitution, which
              recognizes and affirms the Aboriginal and treaty rights of First
              Nations, Inuit and Métis peoples, and fulfil my duties as a
              Canadian citizen."
            </p>
          </div>
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

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-sm border p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">
              About This Study Guide
            </h3>
            <p className="text-gray-700 mb-4">
              This guide will help you prepare for the Canadian citizenship
              test. You should study each chapter thoroughly and practice
              answering questions about Canada's history, government, geography,
              economy, and symbols.
            </p>
            <p className="text-sm text-gray-600">
              All citizenship test questions are based on the information
              provided in this study guide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
