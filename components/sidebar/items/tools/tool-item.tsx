import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { TOOL_DESCRIPTION_MAX, TOOL_NAME_MAX } from "@/db/limits"
import { validateOpenAPI } from "@/lib/openapi-conversion"
import { Tables } from "@/supabase/types"
import { IconBolt } from "@tabler/icons-react"
import { FC, useState } from "react"
import { SidebarItem } from "../all/sidebar-display-item"
import { useTranslation } from "react-i18next"

interface ToolItemProps {
  tool: Tables<"tools">
}

export const ToolItem: FC<ToolItemProps> = ({ tool }) => {
  const { t } = useTranslation()
  const [name, setName] = useState(tool.name)
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState(tool.description)
  const [url, setUrl] = useState(tool.url)
  const [customHeaders, setCustomHeaders] = useState(
    tool.custom_headers as string
  )
  const [schema, setSchema] = useState(tool.schema as string)
  const [schemaError, setSchemaError] = useState("")

  return (
    <SidebarItem
      item={tool}
      isTyping={isTyping}
      contentType="tools"
      icon={<IconBolt size={30} />}
      updateState={{
        name,
        description,
        url,
        custom_headers: customHeaders,
        schema
      }}
      renderInputs={() => (
        <>
          <div className="space-y-1">
            <Label>{t("Name")}</Label>

            <Input
              placeholder={t("Tool name...")}
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={TOOL_NAME_MAX}
            />
          </div>

          <div className="space-y-1">
            <Label>{t("Description")}</Label>

            <Input
              placeholder={t("Tool description...")}
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={TOOL_DESCRIPTION_MAX}
            />
          </div>

          {/* <div className="space-y-1">
            <Label>URL</Label>

            <Input
              placeholder="Tool url..."
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div> */}

          {/* <div className="space-y-3 pt-4 pb-3">
            <div className="flex items-center space-x-2">
              <Checkbox />

              <Label>Web Browsing</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox />

              <Label>Image Generation</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox />

              <Label>Code Interpreter</Label>
            </div>
          </div> */}

          <div className="space-y-1">
            <Label>{t("Custom Headers")}</Label>

            <TextareaAutosize
              placeholder={`{"X-api-key": "1234567890"}`}
              value={customHeaders}
              onValueChange={setCustomHeaders}
              minRows={1}
            />
          </div>

          <div className="space-y-1">
            <Label>{t("Schema")}</Label>

            <TextareaAutosize
              placeholder={`{
                "openapi": "3.1.0",
                "info": {
                  "title": "Get weather data",
                  "description": "Retrieves current weather data for a location.",
                  "version": "v1.0.0"
                },
                "servers": [
                  {
                    "url": "https://weather.example.com"
                  }
                ],
                "paths": {
                  "/location": {
                    "get": {
                      "description": "Get temperature for a specific location",
                      "operationId": "GetCurrentWeather",
                      "parameters": [
                        {
                          "name": "location",
                          "in": "query",
                          "description": "The city and state to retrieve the weather for",
                          "required": true,
                          "schema": {
                            "type": "string"
                          }
                        }
                      ],
                      "deprecated": false
                    }
                  }
                },
                "components": {
                  "schemas": {}
                }
              }`}
              value={schema}
              onValueChange={value => {
                setSchema(value)

                try {
                  const parsedSchema = JSON.parse(value)
                  validateOpenAPI(parsedSchema)
                    .then(() => setSchemaError("")) // Clear error if validation is successful
                    .catch(error => setSchemaError(error.message)) // Set specific validation error message
                } catch (error) {
                  setSchemaError("Invalid JSON format") // Set error for invalid JSON format
                }
              }}
              minRows={15}
            />

            <div className="text-red-500 text-xs">{schemaError}</div>
          </div>
        </>
      )}
    />
  )
}
