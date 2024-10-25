import { ContentType } from "@/types"
import { FC } from "react"
import { Input } from "../ui/input"
import { useTranslation } from "react-i18next"

interface SidebarSearchProps {
  contentType: ContentType
  searchTerm: string
  setSearchTerm: Function
}

export const SidebarSearch: FC<SidebarSearchProps> = ({
  contentType,
  searchTerm,
  setSearchTerm
}) => {
  const { t } = useTranslation()

  return (
    <Input
      placeholder={t(`Search ${contentType}...`)}
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
    />
  )
}
