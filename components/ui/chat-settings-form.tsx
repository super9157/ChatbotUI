"use client"

import { ChatbotUIContext } from "@/context/context"
import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { Button } from "@/components/ui/button"
import { ChatSettings } from "@/types"
import { IconInfoCircle } from "@tabler/icons-react"
import { FC, useContext, useRef, useState } from "react"
import { ModelSelect } from "../models/model-select"
import { AdvancedSettings } from "./advanced-settings"
import { Checkbox } from "./checkbox"
import { Label } from "./label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "./dropdown-menu"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./select"
import { Slider } from "./slider"
import { TextareaAutosize } from "./textarea-autosize"
import { WithTooltip } from "./with-tooltip"
import { useTranslation } from "react-i18next"
import { IconChevronDown } from "@tabler/icons-react"

interface OptionItemProps {
  label: string
  dir: string
  onClick: () => void
}

const OptionItem = ({ label, dir, onClick }: OptionItemProps) => {
  return (
    <div
      className="hover:bg-accent hover:opacity-50 p-2 rounded truncate cursor-pointer"
      onClick={onClick}
      dir={dir}
    >
      {label}
    </div>
  )
}

interface ChatSettingsFormProps {
  chatSettings: ChatSettings
  onChangeChatSettings: (value: ChatSettings) => void
  useAdvancedDropdown?: boolean
  showTooltip?: boolean
}

export const ChatSettingsForm: FC<ChatSettingsFormProps> = ({
  chatSettings,
  onChangeChatSettings,
  useAdvancedDropdown = true,
  showTooltip = true
}) => {
  const { t } = useTranslation()
  const { profile, models } = useContext(ChatbotUIContext)

  if (!profile) return null

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>{t("Model")}</Label>

        <ModelSelect
          selectedModelId={chatSettings.model}
          onSelectModel={model => {
            onChangeChatSettings({ ...chatSettings, model })
          }}
        />
      </div>

      <div className="space-y-1">
        <Label>{t("Prompt")}</Label>

        <TextareaAutosize
          className="border-2 border-input bg-background"
          placeholder={t("You are a helpful AI assistant.")}
          onValueChange={prompt => {
            onChangeChatSettings({ ...chatSettings, prompt })
          }}
          value={chatSettings.prompt}
          minRows={3}
          maxRows={6}
        />
      </div>

      {useAdvancedDropdown ? (
        <AdvancedSettings>
          <AdvancedContent
            chatSettings={chatSettings}
            onChangeChatSettings={onChangeChatSettings}
            showTooltip={showTooltip}
          />
        </AdvancedSettings>
      ) : (
        <div>
          <AdvancedContent
            chatSettings={chatSettings}
            onChangeChatSettings={onChangeChatSettings}
            showTooltip={showTooltip}
          />
        </div>
      )}
    </div>
  )
}

interface AdvancedContentProps {
  chatSettings: ChatSettings
  onChangeChatSettings: (value: ChatSettings) => void
  showTooltip: boolean
}

const AdvancedContent: FC<AdvancedContentProps> = ({
  chatSettings,
  onChangeChatSettings,
  showTooltip
}) => {
  const { t } = useTranslation()

  const isDallE = chatSettings.model === "dall-e-3"
  const selImgRef = useRef<any>()
  const [isImgSizeOpen, setIsImgSizeOpen] = useState(false)

  const onSelectImgSize = (imgSize: any) => {
    onChangeChatSettings({
      ...chatSettings,
      imageSize: imgSize
    })
    setIsImgSizeOpen(false)
  }

  const { dir, profile, selectedWorkspace, availableOpenRouterModels, models } =
    useContext(ChatbotUIContext)

  const isCustomModel = models.some(
    model => model.model_id === chatSettings.model
  )

  function findOpenRouterModel(modelId: string) {
    return availableOpenRouterModels.find(model => model.modelId === modelId)
  }

  const MODEL_LIMITS = CHAT_SETTING_LIMITS[chatSettings.model] || {
    MIN_TEMPERATURE: 0,
    MAX_TEMPERATURE: 1,
    MAX_CONTEXT_LENGTH:
      findOpenRouterModel(chatSettings.model)?.maxContext || 4096
  }

  return (
    <div className="mt-5">
      <div className="space-y-3">
        <Label className="flex items-center gap-1">
          <div>{t("Temperature")}:</div>

          <div>{chatSettings.temperature}</div>
        </Label>

        <Slider
          value={[chatSettings.temperature]}
          onValueChange={temperature => {
            onChangeChatSettings({
              ...chatSettings,
              temperature: temperature[0]
            })
          }}
          min={MODEL_LIMITS.MIN_TEMPERATURE}
          max={MODEL_LIMITS.MAX_TEMPERATURE}
          step={0.01}
        />
      </div>

      <div className="space-y-3 mt-6">
        <Label className="flex items-center gap-1">
          <div>{t("Context Length")}:</div>

          <div>{chatSettings.contextLength}</div>
        </Label>

        <Slider
          value={[chatSettings.contextLength]}
          onValueChange={contextLength => {
            onChangeChatSettings({
              ...chatSettings,
              contextLength: contextLength[0]
            })
          }}
          min={0}
          max={
            isCustomModel
              ? models.find(model => model.model_id === chatSettings.model)
                  ?.context_length
              : MODEL_LIMITS.MAX_CONTEXT_LENGTH
          }
          step={1}
        />
      </div>

      {isDallE && (
        <div className="space-y-3 mt-6">
          <Label className="flex items-center space-x-1 rtl:space-x-reverse">
            <div>{t("Image Size")}</div>
          </Label>
          <DropdownMenu open={isImgSizeOpen} onOpenChange={setIsImgSizeOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                ref={selImgRef}
                className="flex justify-between items-center mb-4 w-full"
                variant="outline"
              >
                <div className="flex items-center">
                  {chatSettings.imageSize
                    ? chatSettings.imageSize
                    : "1024x1024"}
                </div>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              style={{ width: selImgRef?.current?.offsetWidth }}
            >
              <div className="max-h-[300px] overflow-auto">
                {["1024x1024", "1024x1792", "1792x1024"].map((imgSize: any) => (
                  <OptionItem
                    key={imgSize}
                    label={imgSize}
                    dir={dir}
                    onClick={() => onSelectImgSize(imgSize)}
                  />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="flex items-center gap-2 mt-7">
        <Checkbox
          checked={chatSettings.includeProfileContext}
          onCheckedChange={(value: boolean) =>
            onChangeChatSettings({
              ...chatSettings,
              includeProfileContext: value
            })
          }
        />

        <Label>{t("Chats Include Profile Context")}</Label>

        {showTooltip && (
          <WithTooltip
            delayDuration={0}
            display={
              <div className="p-3 w-[400px]">
                {profile?.profile_context || t("No profile context.")}
              </div>
            }
            trigger={
              <IconInfoCircle className="cursor-hover:opacity-50" size={16} />
            }
          />
        )}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <Checkbox
          checked={chatSettings.includeWorkspaceInstructions}
          onCheckedChange={(value: boolean) =>
            onChangeChatSettings({
              ...chatSettings,
              includeWorkspaceInstructions: value
            })
          }
        />

        <Label>{t("Chats Include Workspace Instructions")}</Label>

        {showTooltip && (
          <WithTooltip
            delayDuration={0}
            display={
              <div className="p-3 w-[400px]">
                {selectedWorkspace?.instructions ||
                  t("No workspace instructions.")}
              </div>
            }
            trigger={
              <IconInfoCircle className="cursor-hover:opacity-50" size={16} />
            }
          />
        )}
      </div>

      <div className="mt-5">
        <Label>{t("Embeddings Provider")}</Label>

        <Select
          dir={dir}
          value={chatSettings.embeddingsProvider}
          onValueChange={(embeddingsProvider: "openai" | "local") => {
            onChangeChatSettings({
              ...chatSettings,
              embeddingsProvider
            })
          }}
        >
          <SelectTrigger>
            <SelectValue defaultValue="openai" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="openai">
              {profile?.use_azure_openai ? "Azure OpenAI" : "OpenAI"}
            </SelectItem>

            {window.location.hostname === "localhost" && (
              <SelectItem value="local">{t("Local")}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
