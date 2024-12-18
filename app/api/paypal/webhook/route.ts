import { Database } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  const reqData = await req.json()

  switch (reqData.event_type) {
    case "PAYMENT.SALE.COMPLETED": {
      if (!reqData.resource.custom) {
        return Response.json({ error: { message: "custom id does not exist" } })
      }

      const supabaseAdmin = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", reqData.resource.custom)
        .single()

      if (error) {
        return Response.json({ error: { message: "failed to get buyer info" } })
      } else {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({ subscribe: 2 })
          .eq("id", data.id)

        if (error) {
          return Response.json({
            error: { message: "failed to set pricing status of buyer" }
          })
        }
      }
      break
    }

    case "PAYMENT.SALE.DENIED":
    case "PAYMENT.SALE.REFUNDED":
    case "PAYMENT.SALE.REVERSED": {
      if (!reqData.resource.custom) {
        return Response.json({ success: false })
      }

      const supabaseAdmin = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", reqData.resource.custom)
        .single()

      if (error) {
        return Response.json({ error: { message: "failed to get buyer info" } })
      } else {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({ subscribe: 0 })
          .eq("id", data.id)

        if (error) {
          return Response.json({
            error: { message: "failed to set pricing status of buyer" }
          })
        }
      }
      break
    }
  }

  return Response.json({ success: true })
}
