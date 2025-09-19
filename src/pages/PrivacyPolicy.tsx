import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <h1 className="text-4xl font-bold text-pink-600 border-b-4 border-pink-600 pb-4 mb-8">
              Privacy Policy
            </h1>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-yellow-800">
                <strong>Important:</strong> This privacy policy applies to the Nurture mobile application and website. 
                Since our app is designed for children's learning and development, we have implemented special 
                protections for children's privacy in compliance with COPPA (Children's Online Privacy Protection Act) 
                and other applicable laws.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">1.1 Information from Parents/Guardians</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Account Information:</strong> Email address, display name, and authentication details</li>
                <li><strong>Authentication Data:</strong> Login credentials, authentication tokens, and verification status</li>
                <li><strong>Profile Information:</strong> Name and contact information</li>
                <li><strong>Subscription Information:</strong> Payment and subscription status (if applicable)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">1.2 Information about Children</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Basic Information:</strong> Child's name, age, gender, and date of birth</li>
                <li><strong>Learning Preferences:</strong> Parent's profession/interest preferences for the child</li>
                <li><strong>Onboarding Responses:</strong> Answers to personality and learning style questions</li>
                <li><strong>Learning Progress:</strong> Daily task completions, quiz results, and learning streaks</li>
                <li><strong>Activity Data:</strong> Weekly interest questionnaires, potential assessments, and quiz responses</li>
                <li><strong>Learning Content:</strong> Generated daily tasks, career insights, and personalized recommendations</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">1.3 Technical Information</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Device Information:</strong> Device type, operating system, and app version</li>
                <li><strong>Usage Analytics:</strong> App usage patterns, feature interactions, and performance data</li>
                <li><strong>Log Data:</strong> Server logs, error reports, and debugging information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Information</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">2.1 Primary Purposes</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Personalized Learning:</strong> Create customized daily tasks and learning activities based on the child's responses and progress</li>
                <li><strong>AI-Powered Recommendations:</strong> Use OpenAI's GPT models to generate age-appropriate educational content</li>
                <li><strong>Progress Tracking:</strong> Monitor learning streaks, task completions, and skill development</li>
                <li><strong>Parental Insights:</strong> Provide parents with career insights and learning recommendations for their child</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">2.2 Service Improvement</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Analyze usage patterns to improve our educational algorithms</li>
                <li>Develop new features and learning modules</li>
                <li>Ensure app security and prevent fraud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">3.1 Third-Party Services</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Firebase (Google):</strong> Authentication, database storage, and cloud functions</li>
                <li><strong>OpenAI:</strong> AI content generation for personalized learning materials</li>
                <li><strong>Google Cloud Platform:</strong> Hosting and data processing infrastructure</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">3.2 Data Protection</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>We do not sell, rent, or trade children's personal information</li>
                <li>We do not share personal information with third parties except as described in this policy</li>
                <li>All data sharing is done through secure, encrypted connections</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Storage and Security</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">4.1 Storage Location</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Data is stored on Google Cloud Platform (Firebase/Firestore)</li>
                <li>Servers are located in secure data centers with industry-standard security measures</li>
                <li>All data is encrypted in transit and at rest</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">4.2 Security Measures</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Firebase Authentication for secure user access</li>
                <li>HTTPS encryption for all data transmission</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication for all data access</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Children's Privacy Protection</h2>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800">
                  <strong>COPPA Compliance:</strong> Our app is designed for children and complies with the Children's 
                  Online Privacy Protection Act (COPPA). We collect minimal information necessary for educational 
                  purposes and obtain verifiable parental consent.
                </p>
              </div>

              <h3 className="text-xl font-medium text-gray-700 mb-3">5.1 Parental Consent</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Parents must create accounts and provide consent before children can use the app</li>
                <li>Parents can review, modify, or delete their child's information at any time</li>
                <li>We do not collect more information than is reasonably necessary for the educational purpose</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">5.2 Data Minimization</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>We only collect information directly related to the child's learning experience</li>
                <li>No behavioral advertising or tracking for commercial purposes</li>
                <li>No social features that could expose children to external users</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Data Retention</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">6.1 Retention Periods</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Account Data:</strong> Retained while the account is active and for 2 years after account closure</li>
                <li><strong>Learning Data:</strong> Retained for educational continuity and progress tracking</li>
                <li><strong>Analytics Data:</strong> Aggregated and anonymized data may be retained for service improvement</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">6.2 Data Deletion</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Parents can request deletion of their child's data at any time</li>
                <li>Account deletion will remove all associated child profiles and learning data</li>
                <li>Some data may be retained for legal compliance or legitimate business purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Your Rights and Choices</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">7.1 Parental Rights</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Access:</strong> Review all information collected about your child</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your child's data</li>
                <li><strong>Portability:</strong> Export your child's learning data</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">7.2 Account Management</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Update account information through the app settings</li>
                <li>Manage child profiles and learning preferences</li>
                <li>Control data sharing and privacy settings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Updates to This Policy</h2>
              
              <p className="mb-4">
                We may update this privacy policy from time to time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Posting the updated policy on our website</li>
                <li>Sending email notifications to registered users</li>
                <li>Displaying in-app notifications about policy changes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Contact Information</h2>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 mb-4">
                  <strong>For privacy-related questions or requests:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Email:</strong> cortiqlabs@gmail.com</li>
                  <li><strong>Website:</strong> https://nurture.org.in</li>
                  <li><strong>Address:</strong> RH805, Purva Riviera, Bengaluru - 560037</li>
                </ul>
                <p className="text-green-800 mt-4">
                  We will respond to all privacy inquiries within 30 days.
                </p>
              </div>
            </section>


            <div className="text-center text-gray-600 italic mt-8">
              <p><strong>Last Updated:</strong> September 2025</p>
              <p><strong>Effective Date:</strong> September 2025</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
