import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Loader2, User, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

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

interface Child {
  id: string;
  displayName: string;
  age: number;
  gender: string;
  dateOfBirth: { seconds: number; nanoseconds: number } | string | Date;
  parentId: string;
  imageURL?: string;
  isOnboarded?: boolean;
  status?: 'active' | 'archived';
}

interface ChildManagementProps {
  children: Child[];
  onChildUpdated: () => void;
  onClose: () => void;
}

const ChildManagement: React.FC<ChildManagementProps> = ({ children, onChildUpdated, onClose }) => {
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [archivingChild, setArchivingChild] = useState<string | null>(null);

  const form = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      displayName: '',
      gender: 'male',
      dateOfBirth: '',
    },
  });

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

  const estimateDateOfBirthFromAge = (age: number): string => {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    // Use January 1st as a reasonable estimate
    return `${birthYear}-01-01`;
  };

  const formatDateOfBirth = (timestamp: { seconds: number; nanoseconds: number } | string | Date | any): string => {
    try {
      console.log('formatDateOfBirth input:', timestamp, 'type:', typeof timestamp);
      
      let date: Date;
      
      if (typeof timestamp === 'string') {
        // If it's already a string, try to parse it
        date = new Date(timestamp);
        console.log('Parsed string date:', date);
      } else if (timestamp instanceof Date) {
        // If it's already a Date object
        date = timestamp;
        console.log('Using Date object:', date);
      } else if (timestamp && typeof timestamp === 'object') {
        if ('seconds' in timestamp && typeof timestamp.seconds === 'number') {
          // If it's a Firestore timestamp object
          date = new Date(timestamp.seconds * 1000);
          console.log('Parsed Firestore timestamp:', date);
        } else if ('toDate' in timestamp && typeof timestamp.toDate === 'function') {
          // If it's a Firestore Timestamp object with toDate method
          date = timestamp.toDate();
          console.log('Used toDate() method:', date);
        } else if ('_seconds' in timestamp && typeof timestamp._seconds === 'number') {
          // Alternative Firestore timestamp format
          date = new Date(timestamp._seconds * 1000);
          console.log('Parsed _seconds timestamp:', date);
        } else {
          console.warn('Unknown timestamp object format:', timestamp);
          // Try to convert to string and parse
          const dateStr = timestamp.toString();
          date = new Date(dateStr);
          console.log('Tried toString() conversion:', date);
        }
      } else if (timestamp === null || timestamp === undefined) {
        console.warn('Timestamp is null or undefined');
        return ''; // Return empty string instead of today's date
      } else {
        console.warn('Unexpected timestamp type:', typeof timestamp, timestamp);
        return ''; // Return empty string instead of today's date
      }
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date timestamp:', timestamp, 'resulting date:', date);
        return ''; // Return empty string instead of today's date
      }
      
      const result = date.toISOString().split('T')[0];
      console.log('Final formatted date:', result);
      return result;
    } catch (error) {
      console.error('Error formatting date of birth:', error, 'timestamp:', timestamp);
      return ''; // Return empty string instead of today's date
    }
  };

  const handleEditChild = (child: Child) => {
    console.log('Editing child:', child);
    console.log('Child dateOfBirth:', child.dateOfBirth, 'type:', typeof child.dateOfBirth);
    
    let formattedDate = formatDateOfBirth(child.dateOfBirth);
    console.log('Formatted date for form:', formattedDate);
    
    // If dateOfBirth couldn't be parsed, try to estimate from age
    if (!formattedDate && child.age) {
      formattedDate = estimateDateOfBirthFromAge(child.age);
      console.log('Estimated dateOfBirth from age:', formattedDate);
    }
    
    setEditingChild(child);
    form.reset({
      displayName: child.displayName,
      gender: child.gender as 'male' | 'female' | 'other',
      dateOfBirth: formattedDate || '',
    });
    setShowEditDialog(true);
  };

  const handleSubmitEdit = async (data: ChildFormData) => {
    if (!editingChild) return;

    try {
      setLoading(true);

      const response = await apiClient.editChild({
        childId: editingChild.id,
        displayName: data.displayName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender
      });

      if (response.success) {
        toast.success('Child profile updated successfully!');
        setShowEditDialog(false);
        setEditingChild(null);
        onChildUpdated();
      } else {
        throw new Error(response.message || 'Failed to update child');
      }
      
    } catch (error: any) {
      console.error('Error updating child:', error);
      toast.error(error.message || 'Failed to update child');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveChild = async (childId: string) => {
    try {
      setArchivingChild(childId);

      const response = await apiClient.archiveChild(childId);

      if (response.success) {
        toast.success('Child profile archived successfully!');
        onChildUpdated();
      } else {
        throw new Error(response.message || 'Failed to archive child');
      }
      
    } catch (error: any) {
      console.error('Error archiving child:', error);
      toast.error(error.message || 'Failed to archive child');
    } finally {
      setArchivingChild(null);
    }
  };

  const getChildAvatarColor = (index: number) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Manage Children Profiles</h2>
            <p className="text-gray-600 mt-1">Edit or archive your children's profiles</p>
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {children.map((child, index) => (
              <Card key={child.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        {child.imageURL ? (
                          <img
                            src={child.imageURL}
                            alt={child.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full ${getChildAvatarColor(index)} flex items-center justify-center`}>
                            <span className="text-white text-lg font-bold">
                              {child.displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{child.displayName}</CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span>{child.age} years old</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditChild(child)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-red-600">Archive Child Profile</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-3">
                              <p>
                                Are you sure you want to archive <strong>{child.displayName}</strong>'s profile?
                              </p>
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-800 font-medium text-sm">⚠️ Warning: This action will:</p>
                                <ul className="text-red-700 text-sm mt-2 space-y-1">
                                  <li>• Remove the child from your active children list</li>
                                  <li>• Stop all learning activities and progress tracking</li>
                                  <li>• Archive all learning data (quizzes, tasks, interests)</li>
                                  <li>• This action cannot be undone</li>
                                </ul>
                              </div>
                              <p className="text-sm text-gray-600">
                                The child's data will be preserved but hidden from the dashboard.
                              </p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleArchiveChild(child.id)}
                              disabled={archivingChild === child.id}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {archivingChild === child.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Archiving...
                                </>
                              ) : (
                                'Archive Profile'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600">Gender: </span>
                      <span className="capitalize">{child.gender}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={child.isOnboarded ? "default" : "secondary"}>
                        {child.isOnboarded ? "Onboarded" : "Setup Required"}
                      </Badge>
                      <Badge variant={child.status === 'archived' ? "destructive" : "outline"}>
                        {child.status === 'archived' ? "Archived" : "Active"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {children.length === 0 && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No children found</h3>
              <p className="text-gray-600">Add a child to get started with their learning journey.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Child Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Child Profile</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitEdit)} className="space-y-3 sm:space-y-4">
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
                  onClick={() => setShowEditDialog(false)}
                  disabled={loading}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto order-1 sm:order-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChildManagement;
