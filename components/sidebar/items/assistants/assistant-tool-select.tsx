import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import {
  IconBolt,
  IconChevronDown,
  IconCircleCheckFilled
} from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

interface AssistantToolSelectProps {
  selectedAssistantTools: Tables<"tools">[]
  onAssistantToolsSelect: (tool: Tables<"tools">) => void
}

export const AssistantToolSelect: FC<AssistantToolSelectProps> = ({
  selectedAssistantTools,
  onAssistantToolsSelect
}) => {
  const { t } = useTranslation()
  const { tools } = useContext(ChatbotUIContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100) // FIX: hacky
    }
  }, [isOpen])

  const handleToolSelect = (tool: Tables<"tools">) => {
    onAssistantToolsSelect(tool)
  }

  if (!tools) return null

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={isOpen => {
        setIsOpen(isOpen)
        setSearch("")
      }}
    >
      <DropdownMenuTrigger
        className="justify-start border-2 bg-background px-3 py-5 w-full"
        asChild
      >
        <Button
          ref={triggerRef}
          className="flex justify-between items-center"
          variant="ghost"
        >
          <div className="flex items-center">
            <div className="flex items-center ml-2">
              {selectedAssistantTools.length} {t("tools selected")}
            </div>
          </div>

          <IconChevronDown />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        style={{ width: triggerRef.current?.offsetWidth }}
        className="space-y-2 p-2 overflow-auto"
        align="start"
      >
        <Input
          ref={inputRef}
          placeholder={t("Search tools...")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.stopPropagation()}
        />

        {selectedAssistantTools
          .filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase())
          )
          .map(tool => (
            <AssistantToolItem
              key={tool.id}
              tool={tool}
              selected={selectedAssistantTools.some(
                selectedAssistantRetrieval =>
                  selectedAssistantRetrieval.id === tool.id
              )}
              onSelect={handleToolSelect}
            />
          ))}

        {tools
          .filter(
            tool =>
              !selectedAssistantTools.some(
                selectedAssistantRetrieval =>
                  selectedAssistantRetrieval.id === tool.id
              ) && tool.name.toLowerCase().includes(search.toLowerCase())
          )
          .map(tool => (
            <AssistantToolItem
              key={tool.id}
              tool={tool}
              selected={selectedAssistantTools.some(
                selectedAssistantRetrieval =>
                  selectedAssistantRetrieval.id === tool.id
              )}
              onSelect={handleToolSelect}
            />
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface AssistantToolItemProps {
  tool: Tables<"tools">
  selected: boolean
  onSelect: (tool: Tables<"tools">) => void
}

const AssistantToolItem: FC<AssistantToolItemProps> = ({
  tool,
  selected,
  onSelect
}) => {
  const handleSelect = () => {
    onSelect(tool)
  }

  return (
    <div
      className="flex justify-between items-center hover:opacity-50 py-0.5 cursor-pointer"
      onClick={handleSelect}
    >
      <div className="flex items-center truncate grow">
        <div className="mr-2 min-w-[24px]">
          <IconBolt size={24} />
        </div>

        <div className="truncate">{tool.name}</div>
      </div>

      {selected && (
        <IconCircleCheckFilled size={20} className="flex-none min-w-[30px]" />
      )}
    </div>
  )
}
