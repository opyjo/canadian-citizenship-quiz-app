import type React from "react";
import { BookOpen, Flag, Users, Target, Lightbulb, Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn more about the Canada Citizenship Guide and our mission to help you succeed on your citizenship journey.",
};

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-red-700 mb-4">
            About Canada Citizenship Guide
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Your dedicated partner in preparing for the Canadian Citizenship
            Test and embracing your new life in Canada.
          </p>
        </header>

        <section className="mb-16 bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-center mb-6">
            <Target size={40} className="text-red-600 mr-4" />
            <h2 className="text-3xl font-semibold text-gray-800">
              Our Mission
            </h2>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg">
            Our mission is to provide comprehensive, accessible, and up-to-date
            resources to help aspiring Canadians successfully pass their
            citizenship test. We aim to empower you with the knowledge and
            confidence needed to embark on this important milestone, based on
            the official "Discover Canada: The Rights and Responsibilities of
            Citizenship" study guide.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-10">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <InfoCard
              icon={<BookOpen size={32} className="text-red-600" />}
              title="Comprehensive Content"
              description="Our study materials cover all chapters of the official guide, ensuring you're well-prepared for any question."
            />
            <InfoCard
              icon={<Lightbulb size={32} className="text-red-600" />}
              title="User-Friendly Platform"
              description="Navigate easily through chapters, practice quizzes, and discover essential information about Canada."
            />
            <InfoCard
              icon={<Flag size={32} className="text-red-600" />}
              title="Focus on Canada"
              description="We are dedicated solely to Canadian citizenship, providing tailored content for your specific needs."
            />
            <InfoCard
              icon={<Users size={32} className="text-red-600" />}
              title="Community Support (Coming Soon)"
              description="Connect with fellow applicants, share experiences, and find encouragement on your journey."
            />
            <InfoCard
              icon={<Heart size={32} className="text-red-600" />}
              title="Passion for Canada"
              description="We are passionate about Canada and helping new immigrants feel welcomed and prepared for their citizenship."
            />
            <InfoCard
              icon={<Target size={32} className="text-red-600" />}
              title="Always Improving"
              description="We continuously update our content and features to provide the best possible learning experience."
            />
          </div>
        </section>

        <section className="mb-16 bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-center mb-6">
            <Users size={40} className="text-red-600 mr-4" />
            <h2 className="text-3xl font-semibold text-gray-800">Our Story</h2>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg mb-4">
            Canada Citizenship Guide was born from a desire to simplify the
            journey to Canadian citizenship. We understand that preparing for
            the test can be daunting. Our founders, having navigated this path
            themselves or helped others through it, recognized the need for a
            clear, reliable, and engaging study resource.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            We believe that becoming a Canadian citizen is a momentous occasion,
            and the preparation should be an empowering experience, not a
            stressful one. That's why we've dedicated ourselves to creating a
            platform that not only helps you learn the material but also fosters
            a deeper appreciation for Canada's history, values, and symbols.
          </p>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            Get Started on Your Journey
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            We are thrilled to be a part of your path to Canadian citizenship.
            Explore our study guides, take our practice quizzes, and discover
            the rich tapestry of Canada.
          </p>
          <a
            href="/study/canadian-history"
            className="inline-block bg-red-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-red-700 transition duration-300 text-lg"
          >
            Start Studying Now
          </a>
        </section>
      </div>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function InfoCard({ icon, title, description }: InfoCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-center w-16 h-16 mb-4 bg-red-100 rounded-full mx-auto">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
        {title}
      </h3>
      <p className="text-gray-600 text-center leading-relaxed">{description}</p>
    </div>
  );
}
