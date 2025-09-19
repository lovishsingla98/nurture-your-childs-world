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
// import OnboardingQuestionnaire from './OnboardingQuestionnaire';

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
  isModal?: boolean; // New prop to indicate if it's used in a modal
}

// Removed QuestionAnswer interface - no longer using hardcoded questionnaire

const ChildForm: React.FC<ChildFormProps> = ({ onChildAdded, trigger, isModal = false }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // Removed unused state variables - no longer using hardcoded questionnaire

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

      // Use the new addChild API
      const response = await apiClient.addChild({
        displayName: data.displayName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender
      });

      if (response.success) {
        toast.success('Child added successfully!');
        form.reset();
        setOpen(false);
        onChildAdded(); // Trigger parent component to refresh
        
        // Navigate to initial interest page for the new child
        window.location.href = `/initial-interest/${response.data.child.id}`;
      } else {
        throw new Error(response.message || 'Failed to add child');
      }
      
    } catch (error: any) {
      console.error('Error adding child:', error);
      toast.error(error.message || 'Failed to add child');
    } finally {
      setLoading(false);
    }
  };

  // Removed hardcoded questionnaire handlers - now using API-based onboarding

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

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
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

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-3 sm:pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto order-1 sm:order-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Add Child'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );

  // If used in modal, just return the form content
  if (isModal) {
    return formContent;
  }

  // Otherwise, wrap in Dialog
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
      <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Add New Child</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default ChildForm;
