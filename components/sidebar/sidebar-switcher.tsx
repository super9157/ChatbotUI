import { ContentType } from "@/types"
import {
  IconAdjustmentsHorizontal,
  IconBolt,
  IconBooks,
  IconFile,
  IconMessage,
  IconPencil,
  IconRobotFace,
  IconSparkles,
  IconCoin,
  IconClock
} from "@tabler/icons-react"
import { FC, useContext } from "react"
import Link from "next/link"
import { TabsList } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { ProfileSettings } from "../utility/profile-settings"
import { SidebarSwitchItem } from "./sidebar-switch-item"
import { useTranslation } from "react-i18next"
import { useParams } from "next/navigation"
import { ChatbotUIContext } from "@/context/context"

export const SIDEBAR_ICON_SIZE = 28

interface SidebarSwitcherProps {
  onContentTypeChange: (contentType: ContentType) => void
}

export const SidebarSwitcher: FC<SidebarSwitcherProps> = ({
  onContentTypeChange
}) => {
  const { t } = useTranslation()
  const { dir, profile } = useContext(ChatbotUIContext)
  const params = useParams()

  return (
    <div
      className={`flex flex-col justify-between pb-5 ${dir === "rtl" ? "border-l-2" : "border-r-2"}`}
    >
      <TabsList className="grid grid-rows-9 bg-background h-[440px]">
        <SidebarSwitchItem
          icon={<IconMessage size={SIDEBAR_ICON_SIZE} />}
          contentType="chats"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconAdjustmentsHorizontal size={SIDEBAR_ICON_SIZE} />}
          contentType="presets"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconPencil size={SIDEBAR_ICON_SIZE} />}
          contentType="prompts"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconSparkles size={SIDEBAR_ICON_SIZE} />}
          contentType="models"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconFile size={SIDEBAR_ICON_SIZE} />}
          contentType="files"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconBooks size={SIDEBAR_ICON_SIZE} />}
          contentType="collections"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconRobotFace size={SIDEBAR_ICON_SIZE} />}
          contentType="assistants"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconBolt size={SIDEBAR_ICON_SIZE} />}
          contentType="tools"
          onContentTypeChange={onContentTypeChange}
        />

        {profile!.subscribe === 0 && (
          <WithTooltip
            display={<div>Subscribe</div>}
            trigger={
              <Link
                href={`/${params.locale}/subscribe`}
                className="relative place-items-center grid h-10"
              >
                <IconCoin size={SIDEBAR_ICON_SIZE} />
              </Link>
            }
          />
        )}

        {profile!.subscribe === 1 && (
          <WithTooltip
            display={<div>Processing</div>}
            trigger={
              <div className="relative place-items-center grid h-10">
                <IconClock size={SIDEBAR_ICON_SIZE} />
              </div>
            }
          />
        )}
      </TabsList>

      <div className="flex flex-col items-center space-y-2">
        <WithTooltip
          display={<div>{t("Profile Settings")}</div>}
          trigger={<ProfileSettings />}
        />
      </div>
    </div>
  )
}
