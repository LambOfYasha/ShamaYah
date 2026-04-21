'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Edit, Eye, Trash2, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getGuidelines, createGuideline, updateGuideline, deleteGuideline } from '@/action/guidelineActions';
import GuidelineForm from './guideline-form';

interface GuidelineManagerProps {
  initialGuidelines?: any[];
}

export default function GuidelineManager({ initialGuidelines = [] }: GuidelineManagerProps) {
  const { toast } = useToast();
  const [guidelines, setGuidelines] = useState(initialGuidelines);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingGuideline, setEditingGuideline] = useState<any>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const loadGuidelines = async () => {
    setIsLoading(true);
    try {
      const result = await getGuidelines();
      if (result.success) {
        setGuidelines(result.guidelines || []);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to load guidelines',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load guidelines',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGuidelines();
  }, []);

  const handleCreateGuideline = async (guidelineData: any) => {
    try {
      const result = await createGuideline(guidelineData);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Guideline created successfully',
        });
        setShowForm(false);
        loadGuidelines();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create guideline',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create guideline',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateGuideline = async (guidelineData: any) => {
    if (!editingGuideline) return;
    
    try {
      const result = await updateGuideline(editingGuideline._id, guidelineData);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Guideline updated successfully',
        });
        setShowForm(false);
        setEditingGuideline(null);
        loadGuidelines();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update guideline',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update guideline',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGuideline = async (guidelineId: string) => {
    if (!confirm('Are you sure you want to delete this guideline?')) return;
    
    try {
      const result = await deleteGuideline(guidelineId);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Guideline deleted successfully',
        });
        loadGuidelines();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete guideline',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete guideline',
        variant: 'destructive',
      });
    }
  };

  const openEditForm = (guideline: any) => {
    setEditingGuideline(guideline);
    setShowForm(true);
  };

  const openCreateForm = () => {
    setEditingGuideline(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingGuideline(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Custom Moderation Guidelines</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadGuidelines} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={openCreateForm}>
            <Plus className="w-4 h-4 mr-2" />
            Add Guideline
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {guidelines.map((guideline, index) => (
            <Card key={`${guideline._id}_${index}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{guideline.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={guideline.isActive ? 'default' : 'secondary'}>
                      {guideline.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{guideline.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{guideline.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Usage Count:</span> {guideline.usageCount}
                  </div>
                  <div>
                    <span className="font-medium">Success Rate:</span> {(guideline.successRate * 100).toFixed(1)}%
                  </div>
                  <div>
                    <span className="font-medium">Severity:</span> {guideline.severity}
                  </div>
                  <div>
                    <span className="font-medium">Priority:</span> {guideline.priority}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => openEditForm(guideline)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowDetails(guideline._id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600"
                    onClick={() => handleDeleteGuideline(guideline._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {guidelines.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No custom guidelines created yet.</p>
            <p className="text-sm mt-2">Create your first custom guideline to improve moderation accuracy.</p>
            <Button onClick={openCreateForm} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create First Guideline
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Guideline Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGuideline ? 'Edit Guideline' : 'Create New Guideline'}
            </DialogTitle>
          </DialogHeader>
          <GuidelineForm
            guideline={editingGuideline}
            onSave={editingGuideline ? handleUpdateGuideline : handleCreateGuideline}
            onCancel={closeForm}
          />
        </DialogContent>
      </Dialog>

      {/* Guideline Details Dialog */}
      <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Guideline Details</DialogTitle>
          </DialogHeader>
          {showDetails && guidelines.find(g => g._id === showDetails) && (
            <div className="space-y-4">
              {(() => {
                const guideline = guidelines.find(g => g._id === showDetails);
                return (
                  <>
                    <div>
                      <h3 className="font-medium">Keywords</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {guideline.keywords.map((keyword: string, index: number) => (
                          <Badge key={index} variant="secondary">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">Patterns</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {guideline.patterns.map((pattern: string, index: number) => (
                          <Badge key={index} variant="outline">{pattern}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">Conditions</h3>
                      <div className="text-sm space-y-1 mt-2">
                        <div>Content Type: {guideline.conditions.contentType}</div>
                        <div>User Role: {guideline.conditions.userRole}</div>
                        <div>Content Length: {guideline.conditions.contentLength.min} - {guideline.conditions.contentLength.max}</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">Actions</h3>
                      <div className="text-sm space-y-1 mt-2">
                        <div>Suggested Action: {guideline.actions.suggestedAction}</div>
                        <div>Confidence Threshold: {(guideline.actions.confidenceThreshold * 100).toFixed(1)}%</div>
                        <div>Require Review: {guideline.actions.requireReview ? 'Yes' : 'No'}</div>
                        {guideline.actions.customMessage && (
                          <div>Custom Message: {guideline.actions.customMessage}</div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 