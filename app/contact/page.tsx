import { Mail, Info, MessageSquareHeart, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-stone-100 dark:from-slate-900 dark:to-stone-900 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            We're happy to hear from you! Please find our contact details below.
          </p>
        </header>

        <div className="bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-xl shadow-2xl space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
              <Mail className="w-7 h-7 mr-3 text-sky-600 dark:text-sky-400" />
              Send Us an Email
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-3 text-base sm:text-lg">
              For all inquiries, feedback, or support requests, please email us
              directly at:
            </p>
            <div className="text-center my-4">
              <p className="inline-block bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 font-mono py-3 px-6 rounded-lg text-lg shadow-sm">
                canadacitizenshipguide@gmail.com
              </p>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Please copy and paste this email address into your email client.
            </p>
          </section>

          <hr className="dark:border-slate-700" />

          <section className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center">
                <MessageSquareHeart className="w-6 h-6 mr-2 text-rose-500 dark:text-rose-400" />
                What to Include
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                To help us assist you better, please include a clear subject
                line and a detailed description of your query or feedback.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center">
                <Clock className="w-6 h-6 mr-2 text-amber-500 dark:text-amber-400" />
                Response Time
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                We aim to respond to all emails within 24-48 business hours.
                Your patience is appreciated.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center">
                <Info className="w-6 h-6 mr-2 text-teal-500 dark:text-teal-400" />
                Our Mission
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Canada Citizenship Guide is dedicated to providing comprehensive
                and accessible resources for your journey to Canadian
                citizenship. We are an online resource and do not have a
                physical office for inquiries.
              </p>
            </div>
          </section>
        </div>

        <footer className="text-center mt-12">
          <p className="text-slate-500 dark:text-slate-400">
            Thank you for choosing Canada Citizenship Guide!
          </p>
        </footer>
      </div>
    </div>
  );
}
