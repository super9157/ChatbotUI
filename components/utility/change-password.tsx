"use client"

import { supabase } from "@/lib/supabase/browser-client"
import { useRouter, useParams } from "next/navigation"
import { FC, useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog"
import { Input } from "../ui/input"
import { toast } from "sonner"

interface ChangePasswordProps {}

export const ChangePassword: FC<ChangePasswordProps> = () => {
  const router = useRouter()
  const params = useParams()

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleResetPassword = async () => {
    if (!newPassword) return toast.info("Please enter your new password.")

    await supabase.auth.updateUser({ password: newPassword })

    toast.success("Password changed successfully.")

    return router.push(`/${params.locale}/login`)
  }

  return (
    <Dialog open={true}>
      <DialogContent className="p-4 w-[400px] h-[240px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>

        <Input
          id="password"
          placeholder="New Password"
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />

        <Input
          id="confirmPassword"
          placeholder="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />

        <DialogFooter>
          <Button onClick={handleResetPassword}>Confirm Change</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
