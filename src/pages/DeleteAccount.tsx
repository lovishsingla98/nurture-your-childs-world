import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Mail, AlertTriangle } from 'lucide-react';

const DeleteAccount = () => {
  const [formData, setFormData] = useState({
    email: '',
    childId: '',
    reason: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create email body with deletion request details
    const emailBody = `
Account Deletion Request Details:
===============================

Email: ${formData.email}
Child ID: ${formData.childId || 'Not provided'}
Reason: ${formData.reason || 'Not specified'}
Additional Message: ${formData.message || 'None'}

Request Date: ${new Date().toISOString()}

Please process this account deletion request within 30 days.
    `.trim();
    
    // Open Gmail in browser with pre-filled deletion request
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=cortiqlabs@gmail.com&su=${encodeURIComponent(`Account Deletion Request - ${formData.email}`)}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailLink, '_blank');
    
    setIsSubmitted(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Email Opened</h1>
              <p className="text-gray-600 mb-6">
                We've opened your email client with a pre-filled deletion request. Please send the email to complete your request. We'll process it within 30 days once received.
              </p>
              <Button onClick={() => window.location.href = '/'} className="bg-pink-600 hover:bg-pink-700">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">Delete Account & Data</CardTitle>
            <p className="text-gray-600 mt-2">
              Request permanent deletion of your Nurture account and all associated data
            </p>
          </CardHeader>
          
          <CardContent className="p-8">
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Warning:</strong> This action is irreversible. All your child profiles, learning progress, 
                and personal data will be permanently deleted and cannot be recovered.
              </AlertDescription>
            </Alert>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">What Will Be Deleted</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Your parent account and profile information</li>
                <li>All child profiles and associated data</li>
                <li>Learning progress and streak data</li>
                <li>Daily task completions and responses</li>
                <li>Weekly quiz and assessment results</li>
                <li>Career insights and recommendations</li>
                <li>Onboarding questionnaire responses</li>
                <li>All personal preferences and settings</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">What Will Be Retained</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Anonymized usage analytics (for service improvement)</li>
                <li>Data required for legal compliance (retained for 2 years)</li>
                <li>Backup data (automatically deleted after 30 days)</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Your Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your.email@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="childId">Child ID (if known)</Label>
                <Input
                  id="childId"
                  name="childId"
                  value={formData.childId}
                  onChange={handleInputChange}
                  placeholder="Optional - helps us locate your data faster"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="reason">Reason for Deletion (Optional)</Label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="">Select a reason (optional)</option>
                  <option value="privacy">Privacy concerns</option>
                  <option value="no-longer-needed">No longer using the app</option>
                  <option value="technical-issues">Technical issues</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="message">Additional Message (Optional)</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Any additional information you'd like to share..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Next Steps</h3>
                <ol className="list-decimal pl-6 space-y-1 text-gray-700">
                  <li>Submit this form with your account details</li>
                  <li>We'll send a confirmation email within 24 hours</li>
                  <li>Your account and data will be deleted within 30 days</li>
                  <li>You'll receive a final confirmation when deletion is complete</li>
                </ol>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Request Account Deletion
                </Button>
                <Button
                  type="button"
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-2">
                If you have questions about account deletion or need assistance, contact us:
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> cortiqlabs@gmail.com<br />
                <strong>Response Time:</strong> Within 24 hours
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeleteAccount;
