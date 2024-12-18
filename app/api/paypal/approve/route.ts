import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      throw error
    } else {
      const userId = data.user.id
      const { data: user, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error) {
        throw error
      } else if (user.subscribe === 0) {
        const { error } = await supabase
          .from("profiles")
          .update({ subscribe: 1 })
          .eq("user_id", userId)

        if (error) {
          throw error
        }

        return Response.json({ subscribe: 1 })
      }

      return Response.json({ subscribe: user.subscribe })
    }
  } catch (err: any) {
    return new Response(JSON.stringify(err), { status: 500 })
  }
}
