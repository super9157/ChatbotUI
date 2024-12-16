import { ChatSettings } from "@/types"
import { GoogleGenerativeAI } from "@google/generative-ai"
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
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || ""

    if (!apiKey) {
      throw new Error("Google Gemini Key not found")
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

    const genAI = new GoogleGenerativeAI(apiKey)
    const googleModel = genAI.getGenerativeModel({ model: chatSettings.model })

    const lastMessage = messages.pop()

    const chat = googleModel.startChat({
      history: messages,
      generationConfig: {
        temperature: chatSettings.temperature
      }
    })

    const response = await chat.sendMessageStream(lastMessage.parts)

    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response.stream) {
          const chunkText = chunk.text()
          controller.enqueue(encoder.encode(chunkText))
        }
        controller.close()
      }
    })

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain" }
    })
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Google Gemini API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("api key not valid")) {
      errorMessage =
        "Google Gemini API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
