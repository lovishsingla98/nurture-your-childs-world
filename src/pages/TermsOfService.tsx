import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getCanonicalUrl } from '@/lib/seo';
import { Card, CardContent } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Terms of Service — Nurture</title>
        <link rel="canonical" href={getCanonicalUrl("/terms")} />
      </Helmet>
      <div className="max-w-4xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <h1 className="text-4xl font-bold text-pink-600 border-b-4 border-pink-600 pb-4 mb-8">
              Terms of Service
            </h1>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-yellow-800">
                <strong>Important:</strong> These terms govern your use of the Nurture mobile application and website, operated by Cortiq Labs. By accessing or using Nurture, you (as a parent or legal guardian) agree to these terms on your behalf and on behalf of your child.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                By creating an account, downloading the Nurture app, or accessing our website, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to all of these terms, you must not access or use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Nurture is an AI-powered parenting co-pilot designed to guide and track child learning and development for children ages 3 to 12. We provide:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600">
                <li>Personalized daily tasks and off-screen educational activities.</li>
                <li>Weekly interest and potential assessment questionnaires.</li>
                <li>Bedtime and values-driven moral stories.</li>
                <li>Parenting insights, strengths mapping, and career interest dashboards.</li>
                <li>An AI parent chatbot for data-backed developmental guidance.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Parental Consent & Child Safety</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800">
                  <strong>COPPA Compliance:</strong> In accordance with the Children's Online Privacy Protection Act (COPPA), Nurture requires verifiable parental or guardian consent before collecting any personal information from children under 13.
                </p>
              </div>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600">
                <li>Only parents or legal guardians are permitted to create accounts on Nurture.</li>
                <li>You agree to supervise your child's usage of the application and review the daily activities recommended by our AI.</li>
                <li>You may request deletion of your child's profile and data at any time via the account settings.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. AI-Generated Content Disclaimer</h2>
              <p className="text-gray-600 mb-4 leading-relaxed font-medium">
                Nurture utilizes advanced artificial intelligence technology (including OpenAI's GPT models) to curate daily tasks, educational content, and stories.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600">
                <li><strong>Parental Supervision:</strong> All recommended activities and stories are generated automatically and must be reviewed by a parent or guardian before the child engages with them.</li>
                <li><strong>No Professional Advice:</strong> Insights, recommendations, and AI chatbot responses do not constitute medical, psychological, or professional pedagogical advice. They are meant for general educational guidance only.</li>
                <li><strong>Content Variations:</strong> We strive to keep AI-generated prompts child-friendly and secure. If you ever encounter content you believe is inappropriate, please report it immediately.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. User Accounts & Responsibilities</h2>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600">
                <li>You must provide accurate, current, and complete information during registration.</li>
                <li>You are responsible for keeping your credentials (e.g., Google account logins) secure.</li>
                <li>You agree not to reverse engineer, exploit, or disrupt the operation of Nurture.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Subscriptions, Fees, & Payments</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Nurture may offer subscription-based premium features. By purchasing a subscription:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600">
                <li>You agree to pay all applicable fees and taxes.</li>
                <li>Billing is handled through safe third-party merchants (e.g., Google Play Billing).</li>
                <li>Subscriptions are non-refundable unless required by applicable consumer law. You may cancel renewal at any time.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                All content, trademarks, logos, custom graphics, and software code on Nurture are the property of Cortiq Labs. You are granted a limited, non-exclusive, non-transferable, revocable license to access Nurture for personal, non-commercial use.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                To the maximum extent permitted by law, Cortiq Labs and its suppliers shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of, or inability to use, our services, including any actions taken during AI-generated daily tasks. Nurture is provided on an "AS IS" and "AS AVAILABLE" basis.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Governing Law & Jurisdiction</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of India, specifically the jurisdiction of Karnataka. Any dispute arising out of or related to these terms shall be subject to the exclusive jurisdiction of the courts located in Bengaluru, Karnataka, India.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Contact Information</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 mb-4 font-semibold">
                  For questions, requests, or notices regarding these Terms:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-green-800">
                  <li><strong>Email:</strong> cortiqlabs@gmail.com</li>
                  <li><strong>Website:</strong> https://nurture.org.in</li>
                  <li><strong>Address:</strong> Purva Riviera, Bengaluru - 560037, Karnataka, India</li>
                </ul>
              </div>
            </section>

            <div className="text-center text-gray-600 italic mt-8 border-t pt-4">
              <p><strong>Last Updated:</strong> June 2026</p>
              <p><strong>Effective Date:</strong> June 2026</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
