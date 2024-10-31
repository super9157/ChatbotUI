import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { IconRobotFace } from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useEffect, useRef } from "react"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"
import { useTranslation } from "react-i18next"

interface AssistantPickerProps {}

export const AssistantPicker: FC<AssistantPickerProps> = ({}) => {
  const { t } = useTranslation()
  const {
    assistants,
    assistantImages,
    focusAssistant,
    atCommand,
    isAssistantPickerOpen,
    setIsAssistantPickerOpen
  } = useContext(ChatbotUIContext)

  const { handleSelectAssistant } = usePromptAndCommand()

  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (focusAssistant && itemsRef.current[0]) {
      itemsRef.current[0].focus()
    }
  }, [focusAssistant])

  const filteredAssistants = assistants.filter(assistant =>
    assistant.name.toLowerCase().includes(atCommand.toLowerCase())
  )

  const handleOpenChange = (isOpen: boolean) => {
    setIsAssistantPickerOpen(isOpen)
  }

  const callSelectAssistant = (assistant: Tables<"assistants">) => {
    handleSelectAssistant(assistant)
    handleOpenChange(false)
  }

  const getKeyDownHandler =
    (index: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault()
        handleOpenChange(false)
      } else if (e.key === "Enter") {
        e.preventDefault()
        callSelectAssistant(filteredAssistants[index])
      } else if (
        (e.key === "Tab" || e.key === "ArrowDown") &&
        !e.shiftKey &&
        index === filteredAssistants.length - 1
      ) {
        e.preventDefault()
        itemsRef.current[0]?.focus()
      } else if (e.key === "ArrowUp" && !e.shiftKey && index === 0) {
        // go to last element if arrow up is pressed on first element
        e.preventDefault()
        itemsRef.current[itemsRef.current.length - 1]?.focus()
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const prevIndex =
          index - 1 >= 0 ? index - 1 : itemsRef.current.length - 1
        itemsRef.current[prevIndex]?.focus()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        const nextIndex = index + 1 < itemsRef.current.length ? index + 1 : 0
        itemsRef.current[nextIndex]?.focus()
      }
    }

  return (
    <>
      {isAssistantPickerOpen && (
        <div className="flex flex-col space-y-1 border-2 bg-background p-2 rounded-xl text-sm">
          {filteredAssistants.length === 0 ? (
            <div className="flex justify-center items-center hover:opacity-50 h-14 text-md italic cursor-pointer">
              {t("No matching assistants.")}
            </div>
          ) : (
            <>
              {filteredAssistants.map((item, index) => (
                <div
                  key={item.id}
                  ref={ref => {
                    itemsRef.current[index] = ref
                  }}
                  tabIndex={0}
                  className="flex items-center hover:bg-accent focus:bg-accent p-2 rounded cursor-pointer focus:outline-none gap-3"
                  onClick={() =>
                    callSelectAssistant(item as Tables<"assistants">)
                  }
                  onKeyDown={getKeyDownHandler(index)}
                >
                  {item.image_path ? (
                    <Image
                      src={
                        assistantImages.find(
                          image => image.path === item.image_path
                        )?.url || ""
                      }
                      alt={item.name}
                      width={32}
                      height={32}
                      className="rounded"
                    />
                  ) : (
                    <IconRobotFace size={32} />
                  )}

                  <div className="flex flex-col">
                    <div className="font-bold">{item.name}</div>

                    <div className="opacity-80 text-sm truncate">
                      {item.description || t("No description.")}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </>
  )
}
