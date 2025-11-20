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

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user } = useAuth()

  if (!user) return null

  const userEmail = user.email || 'User'
  const userInitials = userEmail.slice(0, 2).toUpperCase()
  const userUid = user.uid

  return (
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
              <p className="text-sm text-muted-foreground">Free Plan</p>
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
                <div className="text-2xl font-semibold">0</div>
              </div>
              <div>
                <div className="text-muted-foreground">Messages Sent</div>
                <div className="text-2xl font-semibold">0</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
