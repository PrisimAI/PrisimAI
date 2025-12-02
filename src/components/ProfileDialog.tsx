import { useAuth } from '@/contexts/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Conversation } from '@/lib/types'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Helper function to get conversation stats from localStorage
function getConversationStats(): { totalConversations: number; totalMessages: number } {
  if (typeof window === 'undefined') {
    return { totalConversations: 0, totalMessages: 0 }
  }
  try {
    const stored = localStorage.getItem('conversations')
    if (stored) {
      const conversations: Conversation[] = JSON.parse(stored)
      const totalConversations = conversations.length
      const totalMessages = conversations.reduce((sum, conv) => 
        sum + conv.messages.filter(m => m.role === 'user').length, 0
      )
      return { totalConversations, totalMessages }
    }
  } catch (e) {
    console.error('Error loading conversation stats:', e)
  }
  return { totalConversations: 0, totalMessages: 0 }
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user } = useAuth()
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false)
  const [stats, setStats] = useState({ totalConversations: 0, totalMessages: 0 })

  // Load stats when dialog opens
  useEffect(() => {
    if (open) {
      setStats(getConversationStats())
    }
  }, [open])

  // Check if feedback popup should be shown and reset when dialog closes (Bug #19)
  useEffect(() => {
    if (open && user?.uid) {
      const feedbackShown = localStorage.getItem(`feedback_shown_${user.uid}`)
      if (!feedbackShown) {
        setShowFeedbackPopup(true)
      }
    } else {
      // Reset feedback popup state when dialog closes
      setShowFeedbackPopup(false)
    }
  }, [open, user?.uid])

  const handleFeedbackSubmit = () => {
    // Open the feedback form in a new tab
    window.open('https://forms.gle/fwF8pgkTghY8AvBF6', '_blank')
    // Mark feedback as shown
    if (user?.uid) {
      localStorage.setItem(`feedback_shown_${user.uid}`, 'true')
    }
    setShowFeedbackPopup(false)
  }

  if (!user) return null

  const userEmail = user.email || 'User'
  const userInitials = userEmail.slice(0, 2).toUpperCase()
  const userUid = user.uid

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>
              View and manage your account information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{userEmail}</h3>
                <Badge variant="secondary" className="mt-1">
                  Active
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={userEmail} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uid">User ID</Label>
                <Input id="uid" value={userUid} disabled className="font-mono text-xs" />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Account Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Conversations</div>
                  <div className="text-2xl font-semibold">{stats.totalConversations}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Messages Sent</div>
                  <div className="text-2xl font-semibold">{stats.totalMessages}</div>
                </div>
              </div>
            </div>

            {/* Changelog Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                      <span><strong>v1.2.5</strong> - Added restriction for seedream and nanobanana-pro models</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                      <span><strong>v1.2.4</strong> - Implemented one-time feedback popup in profile</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                      <span><strong>v1.2.3</strong> - Added analytics tracking</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                      <span><strong>v1.2.2</strong> - Enhanced model restriction system</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                      <span><strong>v1.2.1</strong> - Improved UI/UX for profile management</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                      <span><strong>v1.2.0</strong> - Added support for new AI models</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                      <span><strong>v1.1.9</strong> - Fixed security vulnerabilities</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0"></span>
                      <span><strong>v1.1.8</strong> - Performance optimizations</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Feedback button */}
            <div className="pt-2">
              <Button
                onClick={handleFeedbackSubmit}
                variant="outline"
                className="w-full"
              >
                Provide Feedback
              </Button>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Popup Modal */}
      <Dialog open={showFeedbackPopup} onOpenChange={setShowFeedbackPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Help Us Improve</DialogTitle>
            <DialogDescription>
              We'd love to hear your feedback to make our platform better!
            </DialogDescription>
          </DialogHeader>
          <p className="py-2">
            Your feedback helps us improve the experience for everyone.
            This is a one-time popup - we won't ask again after you submit.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={() => setShowFeedbackPopup(false)} variant="outline">
              Maybe Later
            </Button>
            <Button onClick={handleFeedbackSubmit}>
              Submit Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
