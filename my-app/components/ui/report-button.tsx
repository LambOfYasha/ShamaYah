"use client"

import * as React from "react"
import { Flag, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface ReportButtonProps {
  contentId: string
  contentType: 'post' | 'comment' | 'blog' | 'communityQuestion' | 'user' | 'teacher'
  contentTitle?: string
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const reportReasons = [
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'copyright', label: 'Copyright Violation' },
  { value: 'violence', label: 'Violence' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'other', label: 'Other' },
]

export function ReportButton({ 
  contentId, 
  contentType, 
  contentTitle, 
  className,
  variant = "ghost",
  size = "sm"
}: ReportButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [reason, setReason] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason) {
      toast({
        title: "Error",
        description: "Please select a reason for the report.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          contentType,
          reason,
          description: description.trim() || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: "Report Submitted",
          description: "Thank you for your report. We'll review it shortly.",
        })
        setOpen(false)
        setReason("")
        setDescription("")
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to submit report. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'post': return 'Community Response'
      case 'comment': return 'Comment'
      case 'blog': return 'Blog Post'
      case 'communityQuestion': return 'Community Question'
      case 'user': return 'User'
      case 'teacher': return 'Teacher'
      default: return type
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          onClick={(e) => {
            e.stopPropagation()
            setOpen(true)
          }}
        >
          <Flag className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline">Report</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Report Content
          </DialogTitle>
          <DialogDescription>
            Help us keep our community safe by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Content Type</Label>
            <Badge variant="secondary" className="w-fit">
              {getContentTypeLabel(contentType)}
            </Badge>
            {contentTitle && (
              <p className="text-sm text-muted-foreground">
                "{contentTitle}"
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Report *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((reportReason) => (
                  <SelectItem key={reportReason.value} value={reportReason.value}>
                    {reportReason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Please provide any additional context that will help us understand the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !reason}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 