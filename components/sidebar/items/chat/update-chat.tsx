import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChatbotUIContext } from "@/context/context"
import { updateChat } from "@/db/chats"
import { Tables } from "@/supabase/types"
import { IconEdit } from "@tabler/icons-react"
import { FC, useContext, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

interface UpdateChatProps {
  chat: Tables<"chats">
}

export const UpdateChat: FC<UpdateChatProps> = ({ chat }) => {
  const { t } = useTranslation()
  const { dir, setChats } = useContext(ChatbotUIContext)

  const buttonRef = useRef<HTMLButtonElement>(null)

  const [showChatDialog, setShowChatDialog] = useState(false)
  const [name, setName] = useState(chat.name)

  const handleUpdateChat = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const updatedChat = await updateChat(chat.id, {
      name
    })
    setChats(prevState =>
      prevState.map(c => (c.id === chat.id ? updatedChat : c))
    )

    setShowChatDialog(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      buttonRef.current?.click()
    }
  }

  return (
    <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
      <DialogTrigger asChild>
        <IconEdit className="hover:opacity-50" size={18} />
      </DialogTrigger>

      <DialogContent dir={dir} onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle className={dir === "rtl" ? "text-right" : "text-left"}>
            {t("Edit Chat")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          <Label>{t("Name")}</Label>

          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowChatDialog(false)}>
            {t("Cancel")}
          </Button>

          <Button ref={buttonRef} onClick={handleUpdateChat}>
            {t("Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
