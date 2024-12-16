import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { getBase64FromDataURL, getMediaTypeFromDataURL } from "@/lib/utils"
import { ChatSettings } from "@/types"
import Anthropic from "@anthropic-ai/sdk"
import { AnthropicStream, StreamingTextResponse } from "ai"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY || ""

    if (!apiKey) {
      throw new Error("Anthropic API Key not found")
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const userSession = await supabase.auth.getSession()
    const userId = userSession.data.session?.user.id
    const { data, error } = await supabase
      .from("profiles")
      .select()
      .eq("user_id", userId)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    if (data.subscribe === 0) {
      throw new Error("You should upgrade your plan.")
    } else if (data.subscribe === 1) {
      throw new Error("Your plan upgrade is currently being processed.")
    }

    let ANTHROPIC_FORMATTED_MESSAGES: any = messages.slice(1)

    ANTHROPIC_FORMATTED_MESSAGES = ANTHROPIC_FORMATTED_MESSAGES?.map(
      (message: any) => {
        const messageContent =
          typeof message?.content === "string"
            ? [message.content]
            : message?.content

        return {
          ...message,
          content: messageContent.map((content: any) => {
            if (typeof content === "string") {
              // Handle the case where content is a string
              return { type: "text", text: content }
            } else if (
              content?.type === "image_url" &&
              content?.image_url?.url?.length
            ) {
              return {
                type: "image",
                source: {
                  type: "base64",
                  media_type: getMediaTypeFromDataURL(content.image_url.url),
                  data: getBase64FromDataURL(content.image_url.url)
                }
              }
            } else {
              return content
            }
          })
        }
      }
    )

    const anthropic = new Anthropic({ apiKey })

    try {
      const response = await anthropic.messages.create({
        model: chatSettings.model,
        messages: ANTHROPIC_FORMATTED_MESSAGES,
        temperature: chatSettings.temperature,
        system: messages[0].content,
        max_tokens:
          CHAT_SETTING_LIMITS[chatSettings.model].MAX_TOKEN_OUTPUT_LENGTH,
        stream: true
      })

      try {
        const stream = AnthropicStream(response)
        return new StreamingTextResponse(stream)
      } catch (error: any) {
        console.error("Error parsing Anthropic API response:", error)
        return new NextResponse(
          JSON.stringify({
            message:
              "An error occurred while parsing the Anthropic API response"
          }),
          { status: 500 }
        )
      }
    } catch (error: any) {
      console.error("Error calling Anthropic API:", error)
      return new NextResponse(
        JSON.stringify({
          message: "An error occurred while calling the Anthropic API"
        }),
        { status: 500 }
      )
    }
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Anthropic API Key not found. Please set it in your profile settings."
    } else if (errorCode === 401) {
      errorMessage =
        "Anthropic API Key is incorrect. Please fix it in your profile settings."
    }

    return new NextResponse(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
