"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { ChatbotUIContext } from "@/context/context"
import { createWorkspace } from "@/db/workspaces"
import useHotkey from "@/lib/hooks/use-hotkey"
import { IconBuilding, IconHome, IconPlus } from "@tabler/icons-react"
import { ChevronsUpDown } from "lucide-react"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import { FC, useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

interface WorkspaceSwitcherProps {}

export const WorkspaceSwitcher: FC<WorkspaceSwitcherProps> = ({}) => {
  useHotkey(";", () => setOpen(prevState => !prevState))
  const { t } = useTranslation()

  const {
    dir,
    workspaces,
    workspaceImages,
    selectedWorkspace,
    setSelectedWorkspace,
    setWorkspaces
  } = useContext(ChatbotUIContext)

  const router = useRouter()
  const params = useParams()

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!selectedWorkspace) return

    setValue(selectedWorkspace.id)
  }, [selectedWorkspace])

  const handleCreateWorkspace = async () => {
    if (!selectedWorkspace) return

    const createdWorkspace = await createWorkspace({
      user_id: selectedWorkspace.user_id,
      default_context_length: selectedWorkspace.default_context_length,
      default_model: selectedWorkspace.default_model,
      default_prompt: selectedWorkspace.default_prompt,
      default_temperature: selectedWorkspace.default_temperature,
      description: "",
      embeddings_provider: "openai",
      include_profile_context: selectedWorkspace.include_profile_context,
      include_workspace_instructions:
        selectedWorkspace.include_workspace_instructions,
      instructions: selectedWorkspace.instructions,
      is_home: false,
      name: "New Workspace"
    })

    setWorkspaces([...workspaces, createdWorkspace])
    setSelectedWorkspace(createdWorkspace)
    setOpen(false)

    return router.push(`/${params.locale}/${createdWorkspace.id}/chat`)
  }

  const getWorkspaceName = (workspaceId: string) => {
    const workspace = workspaces.find(workspace => workspace.id === workspaceId)

    if (!workspace) return

    return workspace.name
  }

  const handleSelect = (workspaceId: string) => {
    const workspace = workspaces.find(workspace => workspace.id === workspaceId)

    if (!workspace) return

    setSelectedWorkspace(workspace)
    setOpen(false)

    return router.push(`/${params.locale}/${workspace.id}/chat`)
  }

  const workspaceImage = workspaceImages.find(
    image => image.workspaceId === selectedWorkspace?.id
  )
  const imageSrc = workspaceImage
    ? workspaceImage.url
    : selectedWorkspace?.is_home
      ? ""
      : ""

  const IconComponent = selectedWorkspace?.is_home ? IconHome : IconBuilding

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex justify-between items-center border-input hover:opacity-50 px-2 py-1 border rounded-md w-full h-[36px] cursor-pointer">
        <div className="flex items-center gap-2 truncate">
          {selectedWorkspace && (
            <div className="flex items-center">
              {workspaceImage ? (
                <Image
                  style={{ width: "22px", height: "22px" }}
                  className="rounded"
                  src={imageSrc}
                  width={22}
                  height={22}
                  alt={selectedWorkspace.name}
                />
              ) : (
                <IconComponent className="mb-0.5" size={22} />
              )}
            </div>
          )}

          {getWorkspaceName(value) || t("Select workspace...")}
        </div>

        <ChevronsUpDown className="opacity-50 shrink-0 size-4" />
      </PopoverTrigger>

      <PopoverContent dir={dir} className="p-2">
        <div className="space-y-2">
          <Button
            className="flex items-center gap-2 w-full"
            size="sm"
            onClick={handleCreateWorkspace}
          >
            <IconPlus />
            <div className="ml-2">{t("New Workspace")}</div>
          </Button>

          <Input
            placeholder={t("Search workspaces...")}
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="flex flex-col space-y-1">
            {workspaces
              .filter(workspace => workspace.is_home)
              .map(workspace => {
                const image = workspaceImages.find(
                  image => image.workspaceId === workspace.id
                )

                return (
                  <Button
                    key={workspace.id}
                    className="flex justify-start items-center gap-3"
                    variant="ghost"
                    onClick={() => handleSelect(workspace.id)}
                  >
                    {image ? (
                      <Image
                        style={{ width: "28px", height: "28px" }}
                        className="rounded"
                        src={image.url || ""}
                        width={28}
                        height={28}
                        alt={workspace.name}
                      />
                    ) : (
                      <IconHome size={28} />
                    )}

                    <div className="font-semibold text-lg">
                      {workspace.name}
                    </div>
                  </Button>
                )
              })}

            {workspaces
              .filter(
                workspace =>
                  !workspace.is_home &&
                  workspace.name.toLowerCase().includes(search.toLowerCase())
              )
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(workspace => {
                const image = workspaceImages.find(
                  image => image.workspaceId === workspace.id
                )

                return (
                  <Button
                    key={workspace.id}
                    className="flex justify-start items-center gap-3"
                    variant="ghost"
                    onClick={() => handleSelect(workspace.id)}
                  >
                    {image ? (
                      <Image
                        style={{ width: "28px", height: "28px" }}
                        className="rounded"
                        src={image.url || ""}
                        width={28}
                        height={28}
                        alt={workspace.name}
                      />
                    ) : (
                      <IconBuilding size={28} />
                    )}

                    <div className="font-semibold text-lg">
                      {workspace.name}
                    </div>
                  </Button>
                )
              })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
