import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { LLMID } from "@/types"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  const json = await request.json()

  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  const freeModels: LLMID[] = ["gpt-3.5-turbo", "gpt-4o", "gpt-4o-mini"]

  try {
    const apiKey = process.env.OPENAI_API_KEY || ""

    if (!apiKey) {
      throw new Error("OpenAI API Key not found")
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

    if (data.subscribe === 0 && !freeModels.includes(chatSettings.model)) {
      throw new Error("You should upgrade your plan.")
    } else if (
      data.subscribe === 1 &&
      !freeModels.includes(chatSettings.model)
    ) {
      throw new Error("Your plan upgrade is currently being processed.")
    }

    if (data.subscribe === 0 && freeModels.includes(chatSettings.model)) {
      if (data.free_questions < 1) {
        throw new Error("There's no remaining free questions.")
      }
    }

    const openai = new OpenAI({ apiKey: apiKey })

    const response = await openai.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages: messages as ChatCompletionCreateParamsBase["messages"],
      temperature: chatSettings.temperature,
      max_tokens:
        chatSettings.model === "gpt-4-vision-preview" ||
        chatSettings.model === "gpt-4o" ||
        chatSettings.model === "gpt-4o-mini"
          ? 4096
          : null, // TODO: Fix
      stream: true
    })

    if (data.subscribe === 0 && freeModels.includes(chatSettings.model)) {
      const { error } = await supabase
        .from("profiles")
        .update({ free_questions: data.free_questions - 1 })
        .eq("user_id", userId)

      if (error) {
        throw new Error(error.message)
      }
    }

    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "OpenAI API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "OpenAI API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
