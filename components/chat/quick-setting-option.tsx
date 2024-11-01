import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { Tables } from "@/supabase/types"
import { IconCircleCheckFilled, IconRobotFace } from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext } from "react"
import { ModelIcon } from "../models/model-icon"
import { DropdownMenuItem } from "../ui/dropdown-menu"
import { ChatbotUIContext } from "@/context/context"

interface QuickSettingOptionProps {
  contentType: "presets" | "assistants"
  isSelected: boolean
  item: Tables<"presets"> | Tables<"assistants">
  onSelect: () => void
  image: string
}

export const QuickSettingOption: FC<QuickSettingOptionProps> = ({
  contentType,
  isSelected,
  item,
  onSelect,
  image
}) => {
  const { dir } = useContext(ChatbotUIContext)
  const modelDetails = LLM_LIST.find(model => model.modelId === item.model)

  return (
    <DropdownMenuItem
      dir={dir}
      tabIndex={0}
      className="items-center cursor-pointer"
      onSelect={onSelect}
    >
      <div className="w-[32px]">
        {contentType === "presets" ? (
          <ModelIcon
            provider={modelDetails?.provider || "custom"}
            width={32}
            height={32}
          />
        ) : image ? (
          <Image
            style={{ width: "32px", height: "32px" }}
            className="rounded"
            src={image}
            alt="Assistant"
            width={32}
            height={32}
          />
        ) : (
          <IconRobotFace
            className="border-DEFAULT border-primary bg-primary p-1 rounded text-secondary"
            size={32}
          />
        )}
      </div>

      <div className="flex flex-col space-y-1 px-4 grow">
        <div className="font-bold text-md">{item.name}</div>

        {item.description && (
          <div className="font-light text-sm">{item.description}</div>
        )}
      </div>

      {isSelected ? <IconCircleCheckFilled size={20} /> : null}
    </DropdownMenuItem>
  )
}
