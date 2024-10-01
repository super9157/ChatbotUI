"use client"

import { ChatbotUIContext } from "@/context/context"
import { getProfileByUserId, updateProfile } from "@/db/profile"
import {
  getHomeWorkspaceByUserId,
  getWorkspacesByUserId
} from "@/db/workspaces"
import {
  fetchHostedModels,
  fetchOpenRouterModels
} from "@/lib/models/fetch-models"
import { supabase } from "@/lib/supabase/browser-client"
import { TablesUpdate } from "@/supabase/types"
import { useRouter } from "next/navigation"
import { useContext, useEffect, useState, useRef } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LimitDisplay } from "@/components/ui/limit-display"
import { PROFILE_DISPLAY_NAME_MAX } from "@/db/limits"

export default function SetupPage({ params }: { params: { locale: string } }) {
  const {
    setProfile,
    setWorkspaces,
    setSelectedWorkspace,
    setEnvKeyMap,
    setAvailableHostedModels,
    setAvailableOpenRouterModels
  } = useContext(ChatbotUIContext)

  const router = useRouter()

  const [loading, setLoading] = useState(true)

  // Profile Step
  const [displayName, setDisplayName] = useState("")
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    ;(async () => {
      const session = (await supabase.auth.getSession()).data.session

      if (!session) {
        return router.push(`/${params.locale}/login`)
      } else {
        const user = session.user

        const profile = await getProfileByUserId(user.id)
        setProfile(profile)

        if (!profile.has_onboarded) {
          setLoading(false)
        } else {
          const data = await fetchHostedModels()

          if (!data) return

          setEnvKeyMap(data.envKeyMap)
          setAvailableHostedModels(data.hostedModels)

          if (profile["openrouter_api_key"] || data.envKeyMap["openrouter"]) {
            const openRouterModels = await fetchOpenRouterModels()
            if (!openRouterModels) return
            setAvailableOpenRouterModels(openRouterModels)
          }

          const homeWorkspaceId = await getHomeWorkspaceByUserId(
            session.user.id
          )
          return router.push(`/${params.locale}/${homeWorkspaceId}/chat`)
        }
      }
    })()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (buttonRef.current) {
        buttonRef.current.click()
      }
    }
  }

  const handleSaveSetupSetting = async () => {
    const session = (await supabase.auth.getSession()).data.session
    if (!session) {
      return router.push(`/${params.locale}/login`)
    }

    const user = session.user
    const profile = await getProfileByUserId(user.id)

    const updateProfilePayload: TablesUpdate<"profiles"> = {
      ...profile,
      has_onboarded: true,
      display_name: displayName
    }

    const updatedProfile = await updateProfile(profile.id, updateProfilePayload)
    setProfile(updatedProfile)

    const workspaces = await getWorkspacesByUserId(profile.user_id)
    const homeWorkspace = workspaces.find(w => w.is_home)

    // There will always be a home workspace
    setSelectedWorkspace(homeWorkspace!)
    setWorkspaces(workspaces)

    return router.push(`/${params.locale}/${homeWorkspace?.id}/chat`)
  }

  if (loading) {
    return null
  }

  return (
    <div className="flex justify-center items-center p-6 w-full max-w-[600px] h-full">
      <Card className="w-full" onKeyDown={handleKeyDown}>
        <CardHeader>
          <CardTitle>
            <div>Welcome to Chatbot UI</div>
          </CardTitle>

          <CardDescription>Let&apos;s create your profile.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Chat Display Name</Label>

            <Input
              placeholder="Your Name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={PROFILE_DISPLAY_NAME_MAX}
            />

            <LimitDisplay
              used={displayName.length}
              limit={PROFILE_DISPLAY_NAME_MAX}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button ref={buttonRef} size="sm" onClick={handleSaveSetupSetting}>
            Start
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
