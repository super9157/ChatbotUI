import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatbotUIContext } from "@/context/context"
import { IconInfoCircle, IconMessagePlus } from "@tabler/icons-react"
import { FC, useContext } from "react"
import { WithTooltip } from "../ui/with-tooltip"
import { useTranslation } from "react-i18next"

interface ChatSecondaryButtonsProps {}

export const ChatSecondaryButtons: FC<ChatSecondaryButtonsProps> = ({}) => {
  const { t } = useTranslation()
  const { dir, selectedChat } = useContext(ChatbotUIContext)

  const { handleNewChat } = useChatHandler()

  return (
    <>
      {selectedChat && (
        <>
          <WithTooltip
            delayDuration={200}
            side={dir === "rtl" ? "left" : "right"}
            display={
              <div>
                <div className="font-bold text-xl">{t("Chat Info")}</div>

                <div className="space-y-2 mx-auto mt-2 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                  <div>
                    {t("Model")}: {selectedChat.model}
                  </div>
                  <div>
                    {t("Prompt")}: {selectedChat.prompt}
                  </div>

                  <div>
                    {t("Temperature")}: {selectedChat.temperature}
                  </div>
                  <div>
                    {t("Context Length")}: {selectedChat.context_length}
                  </div>

                  <div>
                    {t("Profile Context")}:{" "}
                    {selectedChat.include_profile_context
                      ? "Enabled"
                      : "Disabled"}
                  </div>
                  <div>
                    {" "}
                    {t("Workspace Instructions")}:{" "}
                    {selectedChat.include_workspace_instructions
                      ? "Enabled"
                      : "Disabled"}
                  </div>

                  <div>
                    {t("Embeddings Provider")}:{" "}
                    {selectedChat.embeddings_provider}
                  </div>
                </div>
              </div>
            }
            trigger={
              <div className="mt-1">
                <IconInfoCircle
                  className="hover:opacity-50 cursor-default"
                  size={24}
                />
              </div>
            }
          />

          <WithTooltip
            delayDuration={200}
            side={dir === "rtl" ? "left" : "right"}
            display={<div>{t("Start a new chat")}</div>}
            trigger={
              <div className="mt-1">
                <IconMessagePlus
                  className="hover:opacity-50 cursor-pointer"
                  size={24}
                  onClick={handleNewChat}
                />
              </div>
            }
          />
        </>
      )}
    </>
  )
}
