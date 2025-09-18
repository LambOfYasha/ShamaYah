'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Edit, 
  CheckCircle,
  XCircle,
  Users,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateTeacherSpecializations } from '@/action/teacherActions';

interface Specialty {
  _id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
}

interface TeacherData {
  _id: string;
  username: string;
  email: string;
  role: string;
  specializations: string[];
  isActive: boolean;
}

interface SpecializationAssignerProps {
  teacher: TeacherData;
  specialties: Specialty[];
  onUpdate: () => void;
}

export default function SpecializationAssigner({ teacher, specialties, onUpdate }: SpecializationAssignerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSelectedSpecialties(teacher.specializations || []);
  }, [teacher.specializations]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const result = await updateTeacherSpecializations(teacher._id, selectedSpecialties);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Teacher specializations updated successfully",
        });
        onUpdate();
        setIsDialogOpen(false);
      } else {
        throw new Error(result.error || 'Failed to update specializations');
      }
    } catch (error) {
      console.error('Error updating teacher specializations:', error);
      toast({
        title: "Error",
        description: "Failed to update specializations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialtyToggle = (specialtyName: string) => {
    setSelectedSpecialties(prev => {
      if (prev.includes(specialtyName)) {
        return prev.filter(spec => spec !== specialtyName);
      } else {
        return [...prev, specialtyName];
      }
    });
  };

  const activeSpecialties = specialties.filter(spec => spec.isActive);

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Assign Specializations
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Specializations</DialogTitle>
            <DialogDescription>
              Select specializations for {teacher.username}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Current: {teacher.specializations?.length || 0} specializations</span>
            </div>
            
            <Separator />
            
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {activeSpecialties.map((specialty) => {
                  const isSelected = selectedSpecialties.includes(specialty.name);
                  return (
                    <div key={specialty._id} className="flex items-center space-x-3">
                      <Checkbox
                        id={specialty._id}
                        checked={isSelected}
                        onCheckedChange={() => handleSpecialtyToggle(specialty.name)}
                      />
                      <Label 
                        htmlFor={specialty._id} 
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: specialty.color }}
                        />
                        <span className="font-medium">{specialty.name}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            
            {activeSpecialties.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No active specialties available</p>
                <p className="text-sm">Create specialties in the Specialties tab</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 