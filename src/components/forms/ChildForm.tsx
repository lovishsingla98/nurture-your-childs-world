import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import OnboardingQuestionnaire from './OnboardingQuestionnaire';

// Child schema validation
const childSchema = z.object({
  displayName: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Please select a gender',
  }),
  dateOfBirth: z.string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 18;
    }, 'Date of birth must be valid and child must be 18 or younger')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate <= today;
    }, 'Date of birth cannot be in the future'),
});

type ChildFormData = z.infer<typeof childSchema>;

interface ChildFormProps {
  onChildAdded: () => void;
  trigger?: React.ReactNode;
}

interface QuestionAnswer {
  questionId: string;
  question: string;
  answer: string;
}

const ChildForm: React.FC<ChildFormProps> = ({ onChildAdded, trigger }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [childData, setChildData] = useState<any>(null);

  const form = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      displayName: '',
      gender: 'male',
      dateOfBirth: '',
    },
  });

  const onSubmit = async (data: ChildFormData) => {
    try {
      setLoading(true);
      
      // Calculate age from date of birth
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // Get current profile to check child limit
      const currentProfile = await apiClient.getUserProfile();
      const currentChildren = currentProfile.data?.children || [];
      
      // Check if adding a child would exceed the limit
      if (currentChildren.length >= 5) {
        toast.error('Maximum of 5 children allowed per parent');
        return;
      }

      // Store child data temporarily for questionnaire
      const preparedChildData = {
        displayName: data.displayName,
        age: age,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
      };

      setChildData(preparedChildData);
      setShowQuestionnaire(true);
      
    } catch (error: any) {
      console.error('Error preparing child data:', error);
      toast.error(error.message || 'Failed to process child information');
    } finally {
      setLoading(false);
    }
  };

  // Handle questionnaire completion
  const handleQuestionnaireComplete = async (questionnaire: QuestionAnswer[]) => {
    try {
      setLoading(true);

      // Create new child object with questionnaire data
      const newChild = {
        id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        displayName: childData.displayName,
        age: childData.age,
        gender: childData.gender,
        dateOfBirth: childData.dateOfBirth,
        imageURL: '',
        questionnaire: questionnaire,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Get current profile to add child to existing children array
      const currentProfile = await apiClient.getUserProfile();
      const currentChildren = currentProfile.data?.children || [];
      
      // Add new child to the array
      const updatedChildren = [...currentChildren, newChild];

      // Update profile with new children array
      const response = await apiClient.updateParentProfile({
        children: updatedChildren,
      });

      if (response.success) {
        toast.success('Child onboarding completed successfully!');
        form.reset();
        setOpen(false);
        setShowQuestionnaire(false);
        setChildData(null);
        onChildAdded(); // Trigger parent component to refresh
      } else {
        throw new Error(response.message || 'Failed to complete onboarding');
      }
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast.error(error.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  // Handle questionnaire cancellation
  const handleQuestionnaireCancel = () => {
    setShowQuestionnaire(false);
    setChildData(null);
    setLoading(false);
  };

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return Math.max(0, Math.min(18, age));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Child
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={showQuestionnaire ? "sm:max-w-4xl max-h-[90vh] overflow-y-auto" : "sm:max-w-[425px]"}>
        <DialogHeader>
          <DialogTitle>
            {showQuestionnaire ? 'Child Onboarding Questionnaire' : 'Add New Child'}
          </DialogTitle>
        </DialogHeader>
        
        {showQuestionnaire && childData ? (
          <OnboardingQuestionnaire
            childData={childData}
            onComplete={handleQuestionnaireComplete}
            onCancel={handleQuestionnaireCancel}
          />
        ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter child's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </FormControl>
                  {field.value && (
                    <p className="text-sm text-muted-foreground">
                      Age: {calculateAge(field.value)} years old
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Start Onboarding'
                )}
              </Button>
            </div>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChildForm;
