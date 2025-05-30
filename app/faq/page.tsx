import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Calendar,
  MapPin,
  Phone,
  Globe,
  HelpCircle,
} from "lucide-react";

export default function FAQPage() {
  const testFormatInfo = [
    {
      title: "Test Format",
      icon: FileText,
      details: [
        "20 multiple-choice questions",
        "30 minutes to complete",
        "Written test on paper or computer",
        "Available in English and French",
      ],
    },
    {
      title: "Passing Score",
      icon: CheckCircle,
      details: [
        "Must answer 15 out of 20 questions correctly (75%)",
        "No partial credit for answers",
      ],
    },
    {
      title: "Test Topics",
      icon: BookOpen,
      details: [
        "Canadian history",
        "Geography",
        "Economy",
        "Government and laws",
        "Rights and responsibilities of citizenship",
        "Canadian symbols",
      ],
    },
    {
      title: "Age Requirements",
      icon: Users,
      details: [
        "Ages 18-54 must take the test",
        "Ages 55+ may need an interview instead",
        "Under 18 do not take the test",
      ],
    },
  ];

  const faqSections = [
    {
      title: "Test Preparation",
      icon: BookOpen,
      questions: [
        {
          question: "What should I study for the citizenship test?",
          answer:
            "Study the official 'Discover Canada' guide published by IRCC. Focus on Canadian history, geography, economy, government, laws, rights and responsibilities, and symbols. Our comprehensive study guide covers all these topics in detail.",
        },
        {
          question: "How long should I study for the test?",
          answer:
            "Most people study for 2-4 weeks, spending 1-2 hours per day. The time needed depends on your background knowledge and English/French proficiency. Take practice tests to assess your readiness.",
        },
        {
          question: "Are there practice tests available?",
          answer:
            "Yes, we provide comprehensive practice tests that simulate the real exam. Practice tests help you familiarize yourself with the format and identify areas needing more study.",
        },
        {
          question: "What language can I take the test in?",
          answer:
            "The citizenship test is available in English and French. You can choose your preferred official language when you apply for citizenship.",
        },
      ],
    },
    {
      title: "Test Day",
      icon: Calendar,
      questions: [
        {
          question: "What should I bring to the test?",
          answer:
            "Bring all documents requested in your notice to appear, including your Permanent Resident Card, passport, and any other identification. Arrive 30 minutes early.",
        },
        {
          question: "What happens if I arrive late?",
          answer:
            "If you arrive late, you may not be allowed to take the test and will need to reschedule. Plan to arrive at least 30 minutes before your scheduled time.",
        },
        {
          question: "Can I use a dictionary or notes during the test?",
          answer:
            "No, you cannot use any reference materials, dictionaries, notes, or electronic devices during the test. The test is closed-book.",
        },
        {
          question: "How long does the test take?",
          answer:
            "You have 30 minutes to complete 20 multiple-choice questions. Most people finish in 10-15 minutes, but you can use the full 30 minutes if needed.",
        },
      ],
    },
    {
      title: "After the Test",
      icon: CheckCircle,
      questions: [
        {
          question: "When will I know my test results?",
          answer:
            "You'll usually know your results immediately after completing the test. If you pass, you'll be scheduled for a citizenship ceremony. If you don't pass, you'll be informed about next steps.",
        },
        {
          question: "What happens if I don't pass the test?",
          answer:
            "If you don't pass the written test, you'll be scheduled for an interview with a citizenship officer. During the interview, the officer will ask you questions about Canada and assess your knowledge.",
        },
        {
          question: "Can I retake the test if I fail?",
          answer:
            "If you don't pass the interview either, you may be given another opportunity to take the test or attend another interview. IRCC will provide specific instructions based on your situation.",
        },
        {
          question:
            "How long after passing do I attend the citizenship ceremony?",
          answer:
            "Citizenship ceremonies are typically scheduled within 3-6 months after passing your test, depending on your local office's schedule and availability.",
        },
      ],
    },
    {
      title: "Special Circumstances",
      icon: HelpCircle,
      questions: [
        {
          question:
            "What if I have a disability that affects my ability to take the test?",
          answer:
            "IRCC provides accommodations for people with disabilities. Contact them when you apply to discuss your needs. Accommodations may include extra time, alternative formats, or oral testing.",
        },
        {
          question: "What if I can't attend my scheduled test date?",
          answer:
            "Contact IRCC immediately if you can't attend your scheduled test. You may be able to reschedule, but you must provide a valid reason and supporting documentation.",
        },
        {
          question: "Can I bring an interpreter to the test?",
          answer:
            "No, interpreters are not allowed during the citizenship test. The test assesses your knowledge of Canada in English or French, so you must complete it in one of these official languages.",
        },
        {
          question: "What if I'm pregnant or have a medical emergency?",
          answer:
            "If you have a medical condition that prevents you from attending, contact IRCC with medical documentation. They will work with you to reschedule your test when you're able to attend.",
        },
      ],
    },
  ];

  const studyTips = [
    {
      tip: "Create a study schedule",
      description:
        "Set aside regular study time each day, even if it's just 30 minutes",
    },
    {
      tip: "Take practice tests",
      description:
        "Regular practice tests help identify weak areas and build confidence",
    },
    {
      tip: "Focus on weak areas",
      description: "Spend extra time on topics you find challenging",
    },
    {
      tip: "Study with others",
      description:
        "Join study groups or discuss topics with family and friends",
    },
    {
      tip: "Use multiple resources",
      description:
        "Combine our study guide with the official Discover Canada handbook",
    },
    {
      tip: "Stay updated",
      description:
        "Make sure you're studying the most current version of materials",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="text-center mb-8">
            <Badge
              variant="secondary"
              className="mb-4 bg-blue-100 text-blue-800"
            >
              🇨🇦
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Canadian Citizenship Test FAQ
            </h1>
            <p className="text-xl text-gray-600">
              Everything you need to know about the Canadian citizenship test
              format, requirements, and process
            </p>
          </div>
        </div>

        {/* Test Format Overview */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Test Format & Requirements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testFormatInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <Card key={index} className="border-0 shadow-lg">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{info.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {info.details.map((detail, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-600 flex items-start gap-2"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            {faqSections.map((section, sectionIndex) => {
              const IconComponent = section.icon;
              return (
                <div key={sectionIndex}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {section.title}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {section.questions.map((faq, faqIndex) => (
                      <Card
                        key={faqIndex}
                        className="border-0 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <CardHeader>
                          <CardTitle className="text-lg flex items-start gap-2">
                            <HelpCircle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                            {faq.question}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">{faq.answer}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Study Tips */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Study Tips for Success
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyTips.map((tip, index) => (
              <Card key={index} className="border-0 shadow-sm bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {tip.tip}
                      </h4>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Important Reminders */}
        <section className="mb-12">
          <Card className="border-0 shadow-lg bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-yellow-800">
                <AlertCircle className="h-6 w-6" />
                Important Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-yellow-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  Study the most current version of the "Discover Canada" guide
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  Arrive at least 30 minutes before your scheduled test time
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  Bring all required documents as specified in your notice to
                  appear
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  Contact IRCC immediately if you cannot attend your scheduled
                  test
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  You need to score 15 out of 20 questions correctly to pass
                  (75%)
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-red-600 to-blue-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Start Studying?
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Use our comprehensive study guide to prepare for your Canadian
                citizenship test
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/study-guide  ">
                  <Button
                    size="lg"
                    className="bg-white text-red-600 hover:bg-gray-100"
                  >
                    Start Studying Now
                  </Button>
                </Link>
                <Link href="/practice">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white text-red-600 hover:bg-gray-100"
                  >
                    Take Practice Test
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
