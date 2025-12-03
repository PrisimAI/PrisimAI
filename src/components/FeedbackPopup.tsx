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

export function FeedbackPopup() {
  const [feedbackFormOpened, setFeedbackFormOpened] = useLocalStorage<boolean>(
    'feedback-form-opened',
    false
  )
  const [showPopup, setShowPopup] = useState(false)

  // Show popup on initial load if form hasn't been opened yet
  useEffect(() => {
    if (!feedbackFormOpened) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setShowPopup(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [feedbackFormOpened])

  const handleOpenForm = () => {
    // Open the feedback form in a new tab
    window.open('https://forms.gle/fwF8pgkTghY8AvBF6', '_blank')
    
    // Mark as opened and close popup
    setFeedbackFormOpened(true)
    setShowPopup(false)
  }

  // Don't render if already opened before
  if (feedbackFormOpened) {
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
