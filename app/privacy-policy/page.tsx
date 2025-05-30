import {
  ShieldCheck,
  FileText,
  Users,
  Database,
  Share2,
  UserCheck,
  ExternalLink,
  AlertTriangle,
  Mail,
  CalendarDays,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for the Canada Citizenship Guide website.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <header className="mb-10 text-center">
          <ShieldCheck className="mx-auto h-16 w-16 text-red-600 mb-4" />
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Your privacy is important to us.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Last Updated: May 30, 2025
          </p>
        </header>

        <div className="space-y-8 text-gray-700 prose prose-red max-w-none">
          <p className="text-lg leading-relaxed">
            Welcome to Canada Citizenship Guide (the &quot;Website&quot;). We
            are committed to protecting your personal information and your right
            to privacy. If you have any questions or concerns about this privacy
            notice, or our practices with regards to your personal information,
            please contact us at{" "}
            <span className="font-semibold">
              canadacitizenshipguide@gmail.com
            </span>
            .
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <FileText className="h-6 w-6 mr-3 text-red-600" />
              1. Information We Collect
            </h2>
            <p>
              We aim to collect minimal personal information from our users. The
              information we may collect includes:
            </p>
            <ul>
              <li>
                <strong>Information you voluntarily provide:</strong> If you
                contact us directly via email, we may receive additional
                information about you such as your name, email address, the
                contents of the message and/or attachments you may send us, and
                any other information you may choose to provide.
              </li>
              <li>
                <strong>Usage Data (Potentially):</strong> We may collect
                information about how the Website is accessed and used
                (&quot;Usage Data&quot;). This Usage Data may include
                information such as your computer&apos;s Internet Protocol
                address (e.g., IP address), browser type, browser version, the
                pages of our Website that you visit, the time and date of your
                visit, the time spent on those pages, unique device identifiers,
                and other diagnostic data. Currently, we do not actively collect
                this through analytics tools, but this may change in the future.
              </li>
              <li>
                <strong>Local Storage Data:</strong> For features like saving
                quiz progress or user preferences, we may store data locally in
                your browser. This data is stored on your device and is not
                transmitted to our servers unless explicitly stated for a
                specific feature.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <Users className="h-6 w-6 mr-3 text-red-600" />
              2. How We Use Your Information
            </h2>
            <p>
              We use the information we collect in various ways, including to:
            </p>
            <ul>
              <li>Provide, operate, and maintain our Website</li>
              <li>Improve, personalize, and expand our Website</li>
              <li>
                Understand and analyze how you use our Website (if Usage Data is
                collected)
              </li>
              <li>
                Respond to your inquiries, comments, and questions when you
                contact us
              </li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <Share2 className="h-6 w-6 mr-3 text-red-600" />
              3. Information Sharing and Disclosure
            </h2>
            <p>
              We do not sell, trade, or otherwise transfer your personally
              identifiable information to outside parties. This does not include
              trusted third parties who assist us in operating our Website,
              conducting our business, or servicing you, so long as those
              parties agree to keep this information confidential (e.g., hosting
              providers). We may also release your information when we believe
              release is appropriate to comply with the law, enforce our site
              policies, or protect ours or others&apos; rights, property, or
              safety.
            </p>
            <p>
              As this website does not currently have user accounts or direct
              data submission forms beyond email contact, the primary way
              information might be shared is if legally compelled to do so.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <Database className="h-6 w-6 mr-3 text-red-600" />
              4. Data Security
            </h2>
            <p>
              We use administrative, technical, and physical security measures
              to help protect your personal information. While we have taken
              reasonable steps to secure the personal information you provide to
              us, please be aware that despite our efforts, no security measures
              are perfect or impenetrable, and no method of data transmission
              can be guaranteed against any interception or other type of
              misuse. Any information disclosed online is vulnerable to
              interception and misuse by unauthorized parties.
            </p>
            <p>
              Information stored in your browser&apos;s local storage is under
              your control and secured by your browser&apos;s security
              mechanisms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <UserCheck className="h-6 w-6 mr-3 text-red-600" />
              5. Your Data Protection Rights
            </h2>
            <p>
              Depending on your location, you may have the following rights
              regarding your personal information:
            </p>
            <ul>
              <li>
                The right to access – You have the right to request copies of
                your personal data.
              </li>
              <li>
                The right to rectification – You have the right to request that
                we correct any information you believe is inaccurate or complete
                information you believe is incomplete.
              </li>
              <li>
                The right to erasure – You have the right to request that we
                erase your personal data, under certain conditions.
              </li>
              <li>
                The right to restrict processing – You have the right to request
                that we restrict the processing of your personal data, under
                certain conditions.
              </li>
              <li>
                The right to object to processing – You have the right to object
                to our processing of your personal data, under certain
                conditions.
              </li>
              <li>
                The right to data portability – You have the right to request
                that we transfer the data that we have collected to another
                organization, or directly to you, under certain conditions.
              </li>
            </ul>
            <p>
              If you make a request, we have one month to respond to you. If you
              would like to exercise any of these rights, please contact us at
              our email:{" "}
              <span className="font-semibold">
                canadacitizenshipguide@gmail.com
              </span>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <ExternalLink className="h-6 w-6 mr-3 text-red-600" />
              6. Third-Party Links
            </h2>
            <p>
              Our Website may contain links to other websites that are not
              operated by us. If you click on a third-party link, you will be
              directed to that third party&apos;s site. We strongly advise you
              to review the Privacy Policy of every site you visit. We have no
              control over and assume no responsibility for the content, privacy
              policies, or practices of any third-party sites or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <Users className="h-6 w-6 mr-3 text-red-600" />{" "}
              {/* Re-using Users icon, consider specific child icon if available */}
              7. Children&apos;s Privacy
            </h2>
            <p>
              Our Website is not intended for use by children under the age of
              13. We do not knowingly collect personally identifiable
              information from children under 13. If you become aware that a
              child has provided us with Personal Information, please contact
              us. If we become aware that we have collected Personal Information
              from children without verification of parental consent, we take
              steps to remove that information from our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <CalendarDays className="h-6 w-6 mr-3 text-red-600" />
              8. Changes to This Privacy Policy
            </h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the &quot;Last Updated&quot; date at the top of this
              Privacy Policy. You are advised to review this Privacy Policy
              periodically for any changes. Changes to this Privacy Policy are
              effective when they are posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <Mail className="h-6 w-6 mr-3 text-red-600" />
              9. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us:
            </p>
            <p>
              By email:{" "}
              <span className="font-semibold">
                canadacitizenshipguide@gmail.com
              </span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
