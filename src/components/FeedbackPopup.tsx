import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import type { User } from 'firebase/auth'
import type { Conversation } from '@/lib/types'

interface FeedbackPopupProps {
  user: User | null
  conversations: Conversation[]
}

export function FeedbackPopup({ user, conversations }: FeedbackPopupProps) {
  const [feedbackFormOpened, setFeedbackFormOpened] = useLocalStorage<boolean>(
    'feedback-form-opened',
    false
  )
  const [showPopup, setShowPopup] = useState(false)

  // Check if user has sent at least one message
  const hasChattedAtLeastOnce = conversations.some(
    (conversation) => conversation.messages.length > 0
  )

  // Show popup on initial load if form hasn't been opened yet,
  // user is logged in, and user has chatted at least once
  useEffect(() => {
    if (!feedbackFormOpened && user && hasChattedAtLeastOnce) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setShowPopup(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [feedbackFormOpened, user, hasChattedAtLeastOnce])

  const handleOpenForm = () => {
    // Open the feedback form in a new tab
    window.open('https://forms.gle/fwF8pgkTghY8AvBF6', '_blank')
    
    // Mark as opened and close popup
    setFeedbackFormOpened(true)
    setShowPopup(false)
  }

  // Don't render if already opened before, user is not logged in, or hasn't chatted yet
  if (feedbackFormOpened || !user || !hasChattedAtLeastOnce) {
    return null
  }

  return (
    <Dialog open={showPopup} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-6 w-6" />
            We'd Love Your Feedback!
          </DialogTitle>
          <DialogDescription className="text-base">
            Help us improve PrisimAI by sharing your thoughts. Your feedback is invaluable to us!
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            This will only take a minute. We want to hear about:
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>What features you love</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>What we can improve</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Any bugs or issues you've encountered</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Features you'd like to see next</span>
            </li>
          </ul>
        </div>

        <DialogFooter>
          <Button onClick={handleOpenForm} className="w-full">
            Open Feedback Form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
