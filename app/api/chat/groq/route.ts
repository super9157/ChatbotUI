import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export const runtime = "edge"
export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const apiKey = process.env.GROQ_API_KEY || ""

    if (!apiKey) {
      throw new Error("Groq API Key not found")
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

    // Groq is compatible with the OpenAI SDK
    const groq = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    })

    const response = await groq.chat.completions.create({
      model: chatSettings.model,
      messages,
      max_tokens:
        CHAT_SETTING_LIMITS[chatSettings.model].MAX_TOKEN_OUTPUT_LENGTH,
      stream: true
    })

    // Convert the response into a friendly text-stream.
    const stream = OpenAIStream(response)

    // Respond with the stream
    return new StreamingTextResponse(stream)
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Groq API Key not found. Please set it in your profile settings."
    } else if (errorCode === 401) {
      errorMessage =
        "Groq API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}