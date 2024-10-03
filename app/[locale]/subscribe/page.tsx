"use client"
import { Button } from "@/components/ui/button"
import { ChatbotUIContext } from "@/context/context"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { useContext, useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { toast } from "sonner"
import { IconCircleCheckFilled } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

const CheckItem = ({ children }: { children: string }) => {
  return (
    <div className="flex items-center gap-2">
      <IconCircleCheckFilled />
      {children}
    </div>
  )
}

export default function SubscribePage({
  params
}: {
  params: { locale: string }
}) {
  const router = useRouter()
  const [visiblePaypalButton, setVisiblePaypalButton] = useState<boolean>(false)
  const { profile, setProfile } = useContext(ChatbotUIContext)

  const onSelectSubscribe = async () => {
    if (!profile || profile.subscribe !== 0) {
      return router.push(`/${params.locale}/login`)
    }

    setVisiblePaypalButton(true)
  }

  const onSelectFree = () => {
    router.push(`/${params.locale}/login`)
  }

  return (
    <div className="flex flex-col justify-center items-center gap-2 p-6 w-full h-screen">
      <Card className="w-full max-w-[880px]">
        <CardHeader className="text-center">
          <CardTitle>
            <div>Select your Plan</div>
          </CardTitle>

          <CardDescription>
            Subscribe Now and Enjoy unlimited AI Models
          </CardDescription>
        </CardHeader>

        <CardContent className="gap-4 grid grid-cols-1 sm:grid-cols-2">
          <Card className="flex flex-col gap-4 p-6">
            <div className="flex justify-between items-center mb-2">
              <p className="font-bold text-3xl">Free</p>
              <p>
                <span className="font-bold text-3xl">$0</span>/mo
              </p>
            </div>
            <div className="flex flex-col gap-2 h-64">
              <CheckItem>GPT-3.5 Turbo</CheckItem>
              <CheckItem>GPT-4o</CheckItem>
              <CheckItem>GPT-4o Mini</CheckItem>
              <CheckItem>10 Free Questions</CheckItem>
              <CheckItem>Standard chat features</CheckItem>
            </div>
            <Button
              className="block w-full text-lg leading-none"
              size="lg"
              onClick={onSelectFree}
            >
              Remain on Free
            </Button>
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <PayPalScriptProvider
              options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
                components: "buttons",
                intent: "subscription",
                currency: "USD",
                vault: true
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-3xl">Pro</p>
                <p>
                  <span className="font-bold text-3xl">$25</span>/mo
                </p>
              </div>
              <div className="flex flex-col gap-2 h-64">
                <CheckItem>OpenAI</CheckItem>
                <CheckItem>Google Gemini</CheckItem>
                <CheckItem>Anthropic</CheckItem>
                <CheckItem>Mistral</CheckItem>
                <CheckItem>Perplexity</CheckItem>
                <CheckItem>Dall-E-3</CheckItem>
                <CheckItem>Stable Diffusion</CheckItem>
                <CheckItem>Unlimited Questions</CheckItem>
              </div>
              {visiblePaypalButton ? (
                <div className="h-11">
                  <PayPalButtons
                    createSubscription={async (data, actions) => {
                      return actions.subscription.create({
                        plan_id: process.env.NEXT_PUBLIC_PLAN_ID || "",
                        custom_id: profile!.id
                      })
                    }}
                    onApprove={async () => {
                      try {
                        const response = await fetch("/api/paypal/approve", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" }
                        })
                        const result = await response.json()
                        if (result.subscribe) {
                          // @ts-ignore
                          setProfile({
                            ...profile,
                            subscribe: result.subscribe
                          })
                          if (result.subscribe === 2) {
                            toast.success(
                              "Success! Your plan has been upgraded. Enjoy access to all AI models!"
                            )
                          } else if (result.subscribe === 1) {
                            toast.loading(
                              "We're processing your plan upgrade. This will only take a moment..."
                            )
                            const checkSubscribe = setInterval(async () => {
                              const response = await fetch(
                                "/api/paypal/check",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json"
                                  }
                                }
                              )
                              const { subscribe } = await response.json()
                              if (subscribe === 2) {
                                // @ts-ignore
                                setProfile({ ...profile, subscribe: 2 })
                                toast.success(
                                  "Success! Your plan has been upgraded. Enjoy access to all AI models!"
                                )
                                clearInterval(checkSubscribe)
                              }
                            }, 10000)
                          }
                        }
                        router.push(`/${params.locale}/login`)
                      } catch (err: any) {
                        console.log(err)
                        toast.warning("Failed to upgrade, Try again later")
                      }
                    }}
                    style={{
                      label: "subscribe",
                      layout: "horizontal",
                      tagline: false,
                      color: "gold"
                    }}
                  />
                </div>
              ) : (
                <Button
                  className="block w-full text-lg leading-none"
                  variant="primary"
                  size="lg"
                  onClick={onSelectSubscribe}
                >
                  Upgrade to Pro
                </Button>
              )}
            </PayPalScriptProvider>
          </Card>
        </CardContent>
      </Card>
      <Link href={`/${params.locale}/login`}>Go Back</Link>
    </div>
  )
}
