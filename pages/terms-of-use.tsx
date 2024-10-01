import React from "react";
import Head from "next/head";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";

const TermsOfUse: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-white">
      <Head>
        <title>Terms of Use | Sitecore JSS Copilot</title>
      </Head>
      <Header
        session={null}
        maxTries={0}
        CountUsage={0}
        disableLoginAndMaxTries={true}
      />
      <main className="flex-grow container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>
        <div className="space-y-4">
          <p>
            Welcome to Sitecore JSS Copilot. By using our service, you agree to
            these Terms of Use.
          </p>
          <h2 className="text-2xl font-semibold mt-4">1. Data Collection</h2>
          <p>
            We collect certain user information to help us improve our product
            and provide a better experience. This may include:
          </p>
          <ul className="list-disc list-inside ml-4">
            <li>Usage data (e.g., features used, frequency of use)</li>
            <li>User preferences and settings</li>
            <li>Feedback and survey responses</li>
            <li>Technical information about your device and connection</li>
          </ul>
          <p>
            We are committed to protecting your privacy and will only use this
            information to improve our services and as otherwise described in
            our Privacy Policy.
          </p>
          <h2 className="text-2xl font-semibold mt-4">2. Use of Service</h2>
          <p>
            You agree to use Sitecore JSS Copilot only for lawful purposes and
            in accordance with these Terms of Use.
          </p>
          <h2 className="text-2xl font-semibold mt-4">
            3. Intellectual Property
          </h2>
          <p>
            The content and software on Sitecore JSS Copilot are protected by
            intellectual property laws. You may not copy, modify, distribute, or
            create derivative works without our explicit permission.
          </p>
          <h2 className="text-2xl font-semibold mt-4">4. Disclaimer</h2>
          <p>
            Sitecore JSS Copilot is provided &quot;as is&quot; without any
            warranties, express or implied. We do not guarantee that the service
            will be error-free or uninterrupted.
          </p>
          <h2 className="text-2xl font-semibold mt-4">5. Changes to Terms</h2>
          <p>
            We may update these Terms of Use from time to time. We will notify
            you of any significant changes by posting a notice on our website.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfUse;
