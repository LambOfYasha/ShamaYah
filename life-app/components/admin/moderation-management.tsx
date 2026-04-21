'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  FileText,
  User,
  Users,
  Flag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface ModerationReport {
  _id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'investigating' | 'resolved_removed' | 'resolved_warning' | 'resolved_no_action' | 'dismissed';
  contentType: 'post' | 'comment' | 'blog' | 'communityQuestion' | 'user' | 'teacher';
  actionTaken?: 'none' | 'removed' | 'warned' | 'suspended' | 'banned';
  createdAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  reporter: {
    _id: string;
    username: string;
    imageURL?: string;
    role: string;
  };
  reviewedBy?: {
    _id: string;
    username: string;
    imageURL?: string;
    role: string;
  };
  reportedContent?: {
    _id: string;
    title?: string;
    content?: string;
    username?: string;
  };
}

export interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  averageResolutionTime: string;
  reportsByType: Record<string, number>;
  reportsByReason: Record<string, number>;
  recentActivity: Array<{
    _id: string;
    type: 'report' | 'review';
    content: string;
    status: string;
    time: string;
  }>;
}

export interface ModerationFilters {
  status?: string;
  contentType?: string;
  page?: number;
  limit?: number;
}

export default function ModerationManagement() {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionTaken, setActionTaken] = useState<string>('');
  const [filters, setFilters] = useState<ModerationFilters>({
    status: 'all',
    contentType: 'all',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const { toast } = useToast();

  const loadModerationData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.contentType && filters.contentType !== 'all') {
        params.append('contentType', filters.contentType);
      }
      params.append('page', filters.page?.toString() || '1');
      params.append('limit', filters.limit?.toString() || '20');

      const response = await fetch(`/api/admin/moderation?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          toast({
            title: 'Authentication Error',
            description: errorData.error || 'Please sign in to access this feature',
            variant: 'destructive',
          });
          return;
        } else if (response.status === 403) {
          toast({
            title: 'Permission Denied',
            description: errorData.error || 'You do not have permission to access this feature',
            variant: 'destructive',
          });
          return;
        } else {
          toast({
            title: 'Error',
            description: errorData.error || 'Failed to load moderation data',
            variant: 'destructive',
          });
          return;
        }
      }

      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports || []);
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error loading moderation data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load moderation data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModerationData();
  }, [filters]);

  const handleFilterChange = (key: keyof ModerationFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleStatusUpdate = async (reportId: string, newStatus: string, notes?: string, action?: string) => {
    try {
      const response = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          updates: {
            status: newStatus,
            reviewNotes: notes,
            actionTaken: action
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update report',
          variant: 'destructive',
        });
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Report updated successfully',
        });
        
        // Update the local state
        setReports(prev => prev.map(report => 
          report._id === reportId 
            ? { ...report, status: newStatus as any, reviewNotes: notes, actionTaken: action as any }
            : report
        ));
        
        // Refresh data
        loadModerationData();
      }
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to update report',
        variant: 'destructive',
      });
    }
  };

  const handleReviewReport = (report: ModerationReport) => {
    setSelectedReport(report);
    setReviewNotes(report.reviewNotes || '');
    setActionTaken(report.actionTaken || '');
    setShowReportDialog(true);
  };

  const handleSubmitReview = () => {
    if (!selectedReport) return;

    const newStatus = actionTaken === 'removed' ? 'resolved_removed' :
                     actionTaken === 'warned' ? 'resolved_warning' :
                     actionTaken === 'none' ? 'resolved_no_action' :
                     'dismissed';

    handleStatusUpdate(selectedReport._id, newStatus, reviewNotes, actionTaken);
    setShowReportDialog(false);
    setSelectedReport(null);
    setReviewNotes('');
    setActionTaken('');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'investigating': return 'default';
      case 'resolved_removed': return 'destructive';
      case 'resolved_warning': return 'outline';
      case 'resolved_no_action': return 'default';
      case 'dismissed': return 'secondary';
      default: return 'secondary';
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'post': return <MessageSquare className="w-4 h-4" />;
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      case 'blog': return <FileText className="w-4 h-4" />;
      case 'communityQuestion': return <Users className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      case 'teacher': return <User className="w-4 h-4" />;
      default: return <Flag className="w-4 h-4" />;
    }
  };

  const getReasonLabel = (reason: string) => {
    const reasonLabels: Record<string, string> = {
      inappropriate: 'Inappropriate Content',
      spam: 'Spam',
      harassment: 'Harassment',
      misinformation: 'Misinformation',
      copyright: 'Copyright Violation',
      violence: 'Violence',
      hate_speech: 'Hate Speech',
      other: 'Other'
    };
    return reasonLabels[reason] || reason;
  };

  const getActionLabel = (action: string) => {
    const actionLabels: Record<string, string> = {
      none: 'No Action',
      removed: 'Content Removed',
      warned: 'User Warned',
      suspended: 'User Suspended',
      banned: 'User Banned'
    };
    return actionLabels[action] || action;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading moderation data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReports}</div>
              <p className="text-xs text-muted-foreground">
                All time reports
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReports}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Reports</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolvedReports}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.resolvedReports / stats.totalReports) * 100)}% resolution rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageResolutionTime}</div>
              <p className="text-xs text-muted-foreground">
                Target: 4 hours
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved_removed">Resolved - Removed</SelectItem>
                <SelectItem value="resolved_warning">Resolved - Warning</SelectItem>
                <SelectItem value="resolved_no_action">Resolved - No Action</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.contentType || 'all'} onValueChange={(value) => handleFilterChange('contentType', value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Content Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content Types</SelectItem>
                <SelectItem value="post">Community Response</SelectItem>
                <SelectItem value="comment">Comment</SelectItem>
                <SelectItem value="blog">Blog Post</SelectItem>
                <SelectItem value="communityQuestion">Community Question</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={loadModerationData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Content Type</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getReasonLabel(report.reason)}</div>
                          {report.description && (
                            <div className="text-sm text-gray-600 truncate max-w-xs">
                              {report.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getContentTypeIcon(report.contentType)}
                          <span className="capitalize">{report.contentType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{report.reporter.username}</span>
                          <Badge variant="outline" className="text-xs">
                            {report.reporter.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(report.status)}>
                          {report.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReviewReport(report)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {report.status === 'pending' && (
                            <Select 
                              value={report.status} 
                              onValueChange={(value) => handleStatusUpdate(report._id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="investigating">Investigating</SelectItem>
                                <SelectItem value="resolved_removed">Remove</SelectItem>
                                <SelectItem value="resolved_warning">Warn</SelectItem>
                                <SelectItem value="resolved_no_action">No Action</SelectItem>
                                <SelectItem value="dismissed">Dismiss</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reports
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 py-2 text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Review Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
            <DialogDescription>
              Review and take action on this report
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Report Details</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div><strong>Reason:</strong> {getReasonLabel(selectedReport.reason)}</div>
                  <div><strong>Content Type:</strong> {selectedReport.contentType}</div>
                  <div><strong>Reporter:</strong> {selectedReport.reporter.username}</div>
                  <div><strong>Reported At:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</div>
                  {selectedReport.description && (
                    <div><strong>Description:</strong> {selectedReport.description}</div>
                  )}
                </div>
              </div>

              {selectedReport.reportedContent && (
                <div>
                  <h3 className="font-medium">Reported Content</h3>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm">
                      {selectedReport.reportedContent.title && (
                        <div><strong>Title:</strong> {selectedReport.reportedContent.title}</div>
                      )}
                      {selectedReport.reportedContent.content && (
                        <div><strong>Content:</strong> {selectedReport.reportedContent.content}</div>
                      )}
                      {selectedReport.reportedContent.username && (
                        <div><strong>Author:</strong> {selectedReport.reportedContent.username}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Action Taken</label>
                <Select value={actionTaken} onValueChange={setActionTaken}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Action</SelectItem>
                    <SelectItem value="removed">Remove Content</SelectItem>
                    <SelectItem value="warned">Warn User</SelectItem>
                    <SelectItem value="suspended">Suspend User</SelectItem>
                    <SelectItem value="banned">Ban User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add review notes..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitReview}>
                  Submit Review
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 