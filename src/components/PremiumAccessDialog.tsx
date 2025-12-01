import { useState, useEffect } from 'react'
import { Crown, Gift, ExternalLink, X } from 'lucide-react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

interface PremiumAccessDialogProps {
  userEmail: string
}

const PREMIUM_DIALOG_SHOWN_KEY = 'premium-access-dialog-shown'
const PREMIUM_FORM_URL = 'https://forms.gle/avM7rjVzAY4uQDcr7'

export function PremiumAccessDialog({ userEmail }: PremiumAccessDialogProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Check if we've already shown the dialog for this user
    try {
      const shownEmails = localStorage.getItem(PREMIUM_DIALOG_SHOWN_KEY)
      const shownEmailsList: string[] = shownEmails ? JSON.parse(shownEmails) : []
      
      // Use a simple hash of the email to avoid storing actual emails
      const emailHash = btoa(userEmail.toLowerCase())
      
      if (!shownEmailsList.includes(emailHash)) {
        // Show the dialog
        setOpen(true)
        // Mark as shown for this email (store hash, not actual email)
        const updatedList = [...shownEmailsList, emailHash]
        localStorage.setItem(PREMIUM_DIALOG_SHOWN_KEY, JSON.stringify(updatedList))
      }
    } catch (error) {
      // If there's an error parsing localStorage, show the dialog
      console.warn('Error reading premium dialog state:', error)
      setOpen(true)
    }
  }, [userEmail])

  const handleOpenForm = () => {
    window.open(PREMIUM_FORM_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-2 rounded-full">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-xl">
              🎉 Congratulations!
            </DialogTitle>
          </div>
          <DialogDescription className="text-base space-y-3">
            <p>
              You have been selected for the <strong className="text-primary">Premium Access Plan</strong> for <strong className="text-green-600">FREE</strong>!
            </p>
            <p>
              As a premium user, you now have access to <strong>all AI models</strong>, including exclusive premium models that are normally restricted.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Gift className="h-4 w-4 text-primary" />
              <span>Your Premium Benefits:</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• Access to all AI text models</li>
              <li>• Access to all AI image generation models</li>
              <li>• No restrictions on model usage</li>
              <li>• Priority support</li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> To activate and keep your premium access, please fill out our quick feedback form. Your input helps us improve PrisimAI!
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleOpenForm}
              className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
              Fill Out Feedback Form
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="w-full"
            >
              Continue to PrisimAI
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
