import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { IconChevronDown, IconCircleCheckFilled } from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

interface AssignWorkspaces {
  selectedWorkspaces: Tables<"workspaces">[]
  onSelectWorkspace: (workspace: Tables<"workspaces">) => void
}

export const AssignWorkspaces: FC<AssignWorkspaces> = ({
  selectedWorkspaces,
  onSelectWorkspace
}) => {
  const { t } = useTranslation()
  const { dir, workspaces } = useContext(ChatbotUIContext)

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

  const handleWorkspaceSelect = (workspace: Tables<"workspaces">) => {
    onSelectWorkspace(workspace)
  }

  if (!workspaces) return null

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
              {t(`${selectedWorkspaces.length} workspaces selected`)}
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
          dir={dir}
          ref={inputRef}
          placeholder={t("Search workspaces...")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.stopPropagation()}
        />

        {selectedWorkspaces
          .filter(workspace =>
            workspace.name.toLowerCase().includes(search.toLowerCase())
          )
          .map(workspace => (
            <WorkspaceItem
              key={workspace.id}
              selectedWorkspaces={selectedWorkspaces}
              workspace={workspace}
              selected={selectedWorkspaces.some(
                selectedWorkspace => selectedWorkspace.id === workspace.id
              )}
              onSelect={handleWorkspaceSelect}
            />
          ))}

        {workspaces
          .filter(
            workspace =>
              !selectedWorkspaces.some(
                selectedWorkspace => selectedWorkspace.id === workspace.id
              ) && workspace.name.toLowerCase().includes(search.toLowerCase())
          )
          .map(workspace => (
            <WorkspaceItem
              key={workspace.id}
              selectedWorkspaces={selectedWorkspaces}
              workspace={workspace}
              selected={selectedWorkspaces.some(
                selectedWorkspace => selectedWorkspace.id === workspace.id
              )}
              onSelect={handleWorkspaceSelect}
            />
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface WorkspaceItemProps {
  selectedWorkspaces: Tables<"workspaces">[]
  workspace: Tables<"workspaces">
  selected: boolean
  onSelect: (workspace: Tables<"workspaces">) => void
}

const WorkspaceItem: FC<WorkspaceItemProps> = ({
  selectedWorkspaces,
  workspace,
  selected,
  onSelect
}) => {
  const { dir } = useContext(ChatbotUIContext)
  const handleSelect = () => {
    if (selected && selectedWorkspaces.length === 1) {
      toast.info("You must select at least one workspace")
      return
    }

    onSelect(workspace)
  }

  return (
    <div
      dir={dir}
      className="flex justify-between items-center hover:opacity-50 py-0.5 cursor-pointer"
      onClick={handleSelect}
    >
      <div className="flex items-center truncate grow">
        <div className="truncate">{workspace.name}</div>
      </div>

      {selected && (
        <IconCircleCheckFilled size={20} className="flex-none min-w-[30px]" />
      )}
    </div>
  )
}
