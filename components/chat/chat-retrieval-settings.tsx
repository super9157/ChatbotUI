import { ChatbotUIContext } from "@/context/context"
import { IconAdjustmentsHorizontal } from "@tabler/icons-react"
import { FC, useContext, useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger
} from "../ui/dialog"
import { Label } from "../ui/label"
import { Slider } from "../ui/slider"
import { WithTooltip } from "../ui/with-tooltip"
import { useTranslation } from "react-i18next"

interface ChatRetrievalSettingsProps {}

export const ChatRetrievalSettings: FC<ChatRetrievalSettingsProps> = ({}) => {
  const { t } = useTranslation()
  const { sourceCount, setSourceCount } = useContext(ChatbotUIContext)

  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <WithTooltip
          delayDuration={0}
          side="top"
          display={<div>{t("Adjust retrieval settings.")}</div>}
          trigger={
            <IconAdjustmentsHorizontal
              className="hover:opacity-50 pt-[4px] cursor-pointer"
              size={24}
            />
          }
        />
      </DialogTrigger>

      <DialogContent>
        <div className="space-y-3">
          <Label className="flex items-center space-x-1">
            <div>{t("Source Count")}:</div>

            <div>{sourceCount}</div>
          </Label>

          <Slider
            value={[sourceCount]}
            onValueChange={values => {
              setSourceCount(values[0])
            }}
            min={1}
            max={10}
            step={1}
          />
        </div>

        <DialogFooter>
          <Button size="sm" onClick={() => setIsOpen(false)}>
            {t("Save & Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
