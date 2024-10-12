import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react"
import { useTranslation } from "react-i18next"
import { FC, useState } from "react"

interface AdvancedSettingsProps {
  children: React.ReactNode
}

export const AdvancedSettings: FC<AdvancedSettingsProps> = ({ children }) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(
    false
    // localStorage.getItem("advanced-settings-open") === "true"
  )

  const handleOpenChange = (isOpen: boolean) => {
    setIsOpen(isOpen)
    // localStorage.setItem("advanced-settings-open", String(isOpen))
  }

  return (
    <Collapsible className="pt-2" open={isOpen} onOpenChange={handleOpenChange}>
      <CollapsibleTrigger className="hover:opacity-50">
        <div className="flex items-center gap-2 font-bold">
          <div>{t("Advanced Settings")}</div>
          {isOpen ? (
            <IconChevronDown size={20} stroke={3} />
          ) : (
            <IconChevronRight size={20} stroke={3} />
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4">{children}</CollapsibleContent>
    </Collapsible>
  )
}
