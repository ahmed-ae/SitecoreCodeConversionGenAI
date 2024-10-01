import React from "react";
import Head from "next/head";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-white">
      <Head>
        <title>Privacy Policy | Sitecore JSS Copilot</title>
      </Head>
      <Header
        session={null}
        maxTries={0}
        CountUsage={0}
        disableLoginAndMaxTries={true}
      />
      <main className="flex-grow container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="space-y-4">
          <p>
            At Sitecore JSS Copilot, we are committed to protecting your privacy
            and ensuring the security of your personal information. This Privacy
            Policy outlines how we collect, use, and safeguard your data.
          </p>
          <h2 className="text-2xl font-semibold mt-4">
            1. Information We Collect
          </h2>
          <p>We may collect the following types of information:</p>
          <ul className="list-disc list-inside ml-4">
            <li>
              Personal information (e.g., name, email address) when you create
              an account
            </li>
            <li>Usage data (e.g., features used, frequency of use)</li>
            <li>User preferences and settings</li>
            <li>Feedback and survey responses</li>
            <li>Technical information about your device and connection</li>
          </ul>
          <h2 className="text-2xl font-semibold mt-4">
            2. How We Use Your Information
          </h2>
          <p>We use the collected information to:</p>
          <ul className="list-disc list-inside ml-4">
            <li>Provide and improve our services</li>
            <li>Personalize your experience</li>
            <li>Analyze usage patterns and trends</li>
            <li>Communicate with you about our services</li>
          </ul>
          <h2 className="text-2xl font-semibold mt-4">3. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal information against unauthorized access,
            alteration, disclosure, or destruction.
          </p>
          <h2 className="text-2xl font-semibold mt-4">
            4. Third-Party Services
          </h2>
          <p>
            We may use third-party services to help us operate our website and
            provide our services. These services may have access to your
            personal information only to perform specific tasks on our behalf
            and are obligated not to disclose or use it for any other purpose.
          </p>
          <h2 className="text-2xl font-semibold mt-4">5. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal
            information. If you wish to exercise these rights, please contact us
            using the information provided at the end of this policy.
          </p>
          <h2 className="text-2xl font-semibold mt-4">
            6. Changes to This Policy
          </h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the &ldquo;last updated&rdquo; date.
          </p>
          <h2 className="text-2xl font-semibold mt-4">7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at{" "}
            <a href="mailto:ahmedokour86@gmail.com">ahmedokour86@gmail.com</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
