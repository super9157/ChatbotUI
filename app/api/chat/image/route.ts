import { ChatSettings } from "@/types"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    if (chatSettings.model === "dall-e-3") {
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

      if (data.subscribe === 0) {
        throw new Error("You should upgrade your plan.")
      } else if (data.subscribe === 1) {
        throw new Error("Your plan upgrade is currently being processed.")
      }

      const lastMessage = messages.findLast((r: any) => r.role === "user")

      const openai = new OpenAI({ apiKey })

      const response = await openai.images.generate({
        prompt: lastMessage.content,
        model: chatSettings.model,
        n: 1,
        quality: chatSettings.imageSize == "1024x1024" ? "hd" : "standard",
        response_format: "url",
        size: chatSettings.imageSize || "1024x1024"
      })

      const imgUrl = response.data[0].url
      return new Response(`[![image](${imgUrl})](${imgUrl})`)
    } else {
      const apiKey = process.env.STABLE_DIFFUSION_API_KEY || ""

      if (!apiKey) {
        throw new Error("Stable Diffusion API Key not found")
      }

      const lastMessage = messages.findLast((r: any) => r.role === "user")

      const payload = {
        key: apiKey,
        prompt: lastMessage.content,
        width: "1024",
        height: "1024"
      }

      const response = await fetch(
        "https://stablediffusionapi.com/api/v3/text2img",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      )
      const result = await response.json()

      const imgUrl = result.output[0]
      return new Response(`[![image](${imgUrl})](${imgUrl})`)
    }
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
