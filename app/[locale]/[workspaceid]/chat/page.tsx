"use client"

import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatSettings } from "@/components/chat/chat-settings"
import { ChatUI } from "@/components/chat/chat-ui"
import { QuickSettings } from "@/components/chat/quick-settings"
import { Brand } from "@/components/ui/brand"
import { ChatbotUIContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import { useContext } from "react"

export default function ChatPage() {
  useHotkey("o", () => handleNewChat())
  useHotkey("l", () => {
    handleFocusChatInput()
  })

  const { chatMessages } = useContext(ChatbotUIContext)

  const { handleNewChat, handleFocusChatInput } = useChatHandler()

  return (
    <>
      {chatMessages.length === 0 ? (
        <div className="relative flex flex-col justify-center items-center h-full">
          <div className="top-50% left-50% absolute mb-20 -translate-x-50% -translate-y-50%">
            <Brand />
          </div>

          <div className="top-2 left-2 absolute">
            <QuickSettings />
          </div>

          <div className="top-2 right-2 absolute">
            <ChatSettings />
          </div>

          <div className="flex flex-col justify-center items-center grow" />

          <div className="items-end px-2 pt-0 sm:pt-5 pb-3 sm:pb-8 w-full sm:w-[600px] md:w-[700px] lg:w-[700px] xl:w-[800px] min-w-[300px]">
            <ChatInput />
          </div>
        </div>
      ) : (
        <ChatUI />
      )}
    </>
  )
}
