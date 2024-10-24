import { LLM } from "@/types"
import { FC } from "react"
import { ModelIcon } from "./model-icon"
import { IconInfoCircle } from "@tabler/icons-react"
import { WithTooltip } from "../ui/with-tooltip"

interface ModelOptionProps {
  model: LLM
  onSelect: () => void
}

export const ModelOption: FC<ModelOptionProps> = ({ model, onSelect }) => {
  return (
    <WithTooltip
      display={
        <div>
          {model.provider !== "ollama" && model.pricing && (
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-semibold">Input Cost:</span>{" "}
                {model.pricing.inputCost} {model.pricing.currency} per{" "}
                {model.pricing.unit}
              </div>
              {model.pricing.outputCost && (
                <div>
                  <span className="font-semibold">Output Cost:</span>{" "}
                  {model.pricing.outputCost} {model.pricing.currency} per{" "}
                  {model.pricing.unit}
                </div>
              )}
            </div>
          )}
        </div>
      }
      side="bottom"
      trigger={
        <div
          className="flex justify-start space-x-3 hover:bg-accent hover:opacity-50 p-2 rounded w-full truncate cursor-pointer"
          onClick={onSelect}
        >
          <div className="flex items-center gap-2">
            <ModelIcon provider={model.provider} width={28} height={28} />
            <div className="font-semibold text-sm">{model.modelName}</div>
          </div>
        </div>
      }
    />
  )
}
