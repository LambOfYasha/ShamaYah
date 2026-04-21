'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Specialty {
  _id: string;
  name: string;
  description?: string;
  color: string;
  teacherCount: number;
  isActive: boolean;
}

interface SpecialtyManagerProps {
  onSpecialtiesChange?: (specialties: Specialty[]) => void;
}

const defaultSpecialties = [
  { name: 'Theology', description: 'Study of religious beliefs and practices', color: '#3B82F6' },
  { name: 'Biblical Studies', description: 'Analysis and interpretation of biblical texts', color: '#10B981' },
  { name: 'Church History', description: 'Historical development of Christian churches', color: '#F59E0B' },
  { name: 'Systematic Theology', description: 'Organized study of theological doctrines', color: '#8B5CF6' },
  { name: 'Pastoral Care', description: 'Spiritual guidance and counseling', color: '#EF4444' },
  { name: 'Ethics', description: 'Moral principles and values', color: '#06B6D4' },
  { name: 'Apologetics', description: 'Defense of religious beliefs', color: '#84CC16' },
  { name: 'Homiletics', description: 'Art of preaching and sermon preparation', color: '#F97316' },
  { name: 'Liturgy', description: 'Study of worship practices and rituals', color: '#EC4899' },
  { name: 'Mission Studies', description: 'Cross-cultural ministry and evangelism', color: '#6366F1' },
  { name: 'Christian Education', description: 'Teaching and learning in Christian contexts', color: '#14B8A6' },
  { name: 'Counseling', description: 'Psychological and spiritual guidance', color: '#F43F5E' },
  { name: 'Philosophy', description: 'Critical thinking and philosophical inquiry', color: '#8B5A2B' },
  { name: 'Languages', description: 'Biblical and theological language studies', color: '#4B5563' },
  { name: 'Archaeology', description: 'Study of ancient artifacts and sites', color: '#7C3AED' }
];

const colorOptions = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', 
  '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E', 
  '#8B5A2B', '#4B5563', '#7C3AED', '#059669', '#DC2626', '#7C2D12'
];

export default function SpecialtyManager({ onSpecialtiesChange }: SpecialtyManagerProps) {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/specialties');
      if (response.ok) {
        const data = await response.json();
        setSpecialties(data.specialties || defaultSpecialties.map((spec, index) => ({
          _id: `spec-${index}`,
          ...spec,
          teacherCount: 0,
          isActive: true
        })).map(spec => ({
          ...spec,
          teacherCount: spec.teacherCount || 0
        })));
      } else {
        // Fallback to default specialties
        setSpecialties(defaultSpecialties.map((spec, index) => ({
          _id: `spec-${index}`,
          ...spec,
          teacherCount: 0,
          isActive: true
        })).map(spec => ({
          ...spec,
          teacherCount: spec.teacherCount || 0
        })));
      }
    } catch (error) {
      console.error('Error loading specialties:', error);
      // Fallback to default specialties
      setSpecialties(defaultSpecialties.map((spec, index) => ({
        _id: `spec-${index}`,
        ...spec,
        teacherCount: 0,
        isActive: true
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Specialty name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const specialtyData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined
      };

      if (editingSpecialty) {
        // Update existing specialty
        const response = await fetch(`/api/admin/specialties/${editingSpecialty._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(specialtyData)
        });

        if (response.ok) {
          const updatedSpecialty = await response.json();
          setSpecialties(prev => prev.map(spec => 
            spec._id === editingSpecialty._id ? updatedSpecialty : spec
          ));
          toast({
            title: "Success",
            description: "Specialty updated successfully",
          });
        } else {
          throw new Error('Failed to update specialty');
        }
      } else {
        // Create new specialty
        const response = await fetch('/api/admin/specialties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(specialtyData)
        });

        if (response.ok) {
          const newSpecialty = await response.json();
          setSpecialties(prev => [...prev, newSpecialty]);
          toast({
            title: "Success",
            description: "Specialty created successfully",
          });
        } else {
          throw new Error('Failed to create specialty');
        }
      }

      handleCloseDialog();
      onSpecialtiesChange?.(specialties);
    } catch (error) {
      console.error('Error saving specialty:', error);
      toast({
        title: "Error",
        description: "Failed to save specialty. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSpecialty = async (specialtyId: string) => {
    try {
      const response = await fetch(`/api/admin/specialties/${specialtyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSpecialties(prev => prev.filter(spec => spec._id !== specialtyId));
        toast({
          title: "Success",
          description: "Specialty deleted successfully",
        });
        onSpecialtiesChange?.(specialties);
      } else {
        throw new Error('Failed to delete specialty');
      }
    } catch (error) {
      console.error('Error deleting specialty:', error);
      toast({
        title: "Error",
        description: "Failed to delete specialty. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (specialtyId: string) => {
    try {
      const specialty = specialties.find(spec => spec._id === specialtyId);
      if (!specialty) return;

      const response = await fetch(`/api/admin/specialties/${specialtyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !specialty.isActive })
      });

      if (response.ok) {
        setSpecialties(prev => prev.map(spec => 
          spec._id === specialtyId ? { ...spec, isActive: !spec.isActive } : spec
        ));
        toast({
          title: "Success",
          description: `Specialty ${specialty.isActive ? 'deactivated' : 'activated'} successfully`,
        });
        onSpecialtiesChange?.(specialties);
      } else {
        throw new Error('Failed to update specialty status');
      }
    } catch (error) {
      console.error('Error updating specialty status:', error);
      toast({
        title: "Error",
        description: "Failed to update specialty status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditSpecialty = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    setFormData({
      name: specialty.name,
      description: specialty.description || '',
      color: specialty.color
    });
    setIsDialogOpen(true);
  };

  const handleCreateSpecialty = () => {
    setEditingSpecialty(null);
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6'
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSpecialty(null);
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Specialty Management</h2>
          <p className="text-gray-600">Manage teacher specializations and areas of expertise</p>
        </div>
        <Button onClick={handleCreateSpecialty}>
          <Plus className="w-4 h-4 mr-2" />
          Add Specialty
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Specialties</p>
                <p className="text-2xl font-bold">{specialties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Specialties</p>
                <p className="text-2xl font-bold">{specialties.filter(s => s.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Teachers</p>
                <p className="text-2xl font-bold">{specialties.reduce((sum, spec) => sum + (spec.teacherCount || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Specialties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specialties.map((specialty) => (
          <Card key={specialty._id} className={`${!specialty.isActive ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: specialty.color }}
                  ></div>
                  <h3 className="font-semibold">{specialty.name}</h3>
                  {!specialty.isActive && (
                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSpecialty(specialty)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Specialty</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{specialty.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteSpecialty(specialty._id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              
              {specialty.description && (
                <p className="text-sm text-gray-600 mb-3">{specialty.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="w-3 h-3" />
                  <span>{specialty.teacherCount || 0} teachers</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(specialty._id)}
                >
                  {specialty.isActive ? (
                    <XCircle className="w-3 h-3 text-red-500" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSpecialty ? 'Edit Specialty' : 'Add New Specialty'}
            </DialogTitle>
            <DialogDescription>
              {editingSpecialty 
                ? 'Update the specialty information below.'
                : 'Create a new specialty for teachers to choose from.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter specialty name"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description (optional)"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
          </form>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingSpecialty ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 