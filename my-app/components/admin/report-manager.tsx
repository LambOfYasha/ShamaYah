'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, BarChart3, Download, Eye, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateReport, exportReport, getReportTemplates } from '@/action/reportActions';

interface ReportManagerProps {
  initialTemplates?: any[];
  initialAnalytics?: any;
}

export default function ReportManager({ initialTemplates = [], initialAnalytics }: ReportManagerProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState(initialTemplates);
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const handleGenerateReport = async (template: any) => {
    setIsGenerating(true);
    try {
      const result = await generateReport(template.config);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Report generated successfully',
        });
        setSelectedTemplate(result.report);
        setShowReportDialog(true);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to generate report',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReport = async (format: string) => {
    if (!selectedTemplate) return;
    
    try {
      const result = await exportReport(selectedTemplate.reportId, format);
      if (result.success) {
        toast({
          title: 'Success',
          description: `Report exported as ${format.toUpperCase()}`,
        });
        // In a real implementation, you would trigger a download
        console.log('Export data:', result.exportData);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to export report',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Advanced Reporting</h2>
        <Button disabled={isGenerating}>
          <Download className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Report Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGenerateReport(template)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                    <Button size="sm" variant="outline">
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">{analytics.totalModerations}</div>
                    <div className="text-sm text-gray-600">Total Moderations</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">{(analytics.moderationRate * 100).toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Moderation Rate</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Allowed Content:</span>
                    <span className="font-medium">{analytics.allowedContent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flagged Content:</span>
                    <span className="font-medium">{analytics.flaggedContent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Blocked Content:</span>
                    <span className="font-medium">{analytics.blockedContent}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No analytics data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Preview Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-6">
              {/* Report Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Report Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedTemplate.summary.totalModerations}</div>
                      <div className="text-sm text-gray-600">Total Moderations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedTemplate.summary.allowedContent}</div>
                      <div className="text-sm text-gray-600">Allowed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedTemplate.summary.flaggedContent}</div>
                      <div className="text-sm text-gray-600">Flagged</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedTemplate.summary.blockedContent}</div>
                      <div className="text-sm text-gray-600">Blocked</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {selectedTemplate.recommendations && selectedTemplate.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedTemplate.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{rec.title}</h4>
                            <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'outline'}>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{rec.description}</p>
                          <p className="text-xs text-gray-500 mt-2">Impact: {rec.impact}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button onClick={() => handleExportReport('pdf')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button onClick={() => handleExportReport('excel')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Excel
                    </Button>
                    <Button onClick={() => handleExportReport('csv')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button onClick={() => handleExportReport('json')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 