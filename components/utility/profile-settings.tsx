import { ChatbotUIContext } from "@/context/context"
import { PROFILE_CONTEXT_MAX, PROFILE_DISPLAY_NAME_MAX } from "@/db/limits"
import { updateProfile } from "@/db/profile"
import { uploadProfileImage } from "@/db/storage/profile-images"
import { fetchOpenRouterModels } from "@/lib/models/fetch-models"
import { LLM_LIST_MAP } from "@/lib/models/llm/llm-list"
import { supabase } from "@/lib/supabase/browser-client"
import { OpenRouterLLM } from "@/types"
import { IconLogout, IconUser, IconChevronDown } from "@tabler/icons-react"
import Image from "next/image"
import { useRouter, useParams, usePathname } from "next/navigation"
import { FC, useContext, useRef, useState } from "react"
import { toast } from "sonner"
import { SIDEBAR_ICON_SIZE } from "../sidebar/sidebar-switcher"
import { Button } from "../ui/button"
import ImagePicker from "../ui/image-picker"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { LimitDisplay } from "../ui/limit-display"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../ui/sheet"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { ThemeSwitcher } from "./theme-switcher"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "react-i18next"
import i18Config from "@/next-i18next.config"

export interface OptionItemProps {
  label: string
  dir: string
  onClick: () => void
}

export const OptionItem = ({ label, dir, onClick }: OptionItemProps) => {
  return (
    <div
      className="hover:bg-accent hover:opacity-50 p-2 rounded truncate cursor-pointer"
      onClick={onClick}
      dir={dir}
    >
      {label}
    </div>
  )
}

interface ProfileSettingsProps {}

export const ProfileSettings: FC<ProfileSettingsProps> = ({}) => {
  const {
    profile,
    setProfile,
    dir,
    setDir,
    envKeyMap,
    setAvailableHostedModels,
    setAvailableOpenRouterModels,
    availableOpenRouterModels
  } = useContext(ChatbotUIContext)

  const router = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLButtonElement>(null)
  const { t } = useTranslation()

  const params = useParams()
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isLocaleOpen, setIsLocaleOpen] = useState<boolean>(false)
  const [isDirOpen, setIsDirOpen] = useState<boolean>(false)

  const [selectedLocale, setSelectedLocale] = useState<string>(
    params.locale as string
  )
  const [selectedDir, setSelectedDir] = useState(dir)
  const locales = i18Config.i18n.locales

  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [profileImageSrc, setProfileImageSrc] = useState(
    profile?.image_url || ""
  )
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileInstructions, setProfileInstructions] = useState(
    profile?.profile_context || ""
  )

  const onSelectLocale: (locale: string) => void = (locale: string) => {
    setSelectedLocale(locale)
    localStorage.setItem("locale", locale)
    if (locale === "ar" || locale === "he") {
      setSelectedDir("rtl")
      localStorage.setItem("dir", "rtl")
    } else {
      setSelectedDir("ltr")
      localStorage.setItem("dir", "ltr")
    }
    setIsLocaleOpen(false)
  }

  const onSelectDir: (dir: "ltr" | "rtl") => void = (dir: "ltr" | "rtl") => {
    setSelectedDir(dir)
    localStorage.setItem("dir", dir)
    setIsDirOpen(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(`/${params.locale}/login`)
    router.refresh()
    return
  }

  const handleSave = async () => {
    if (!profile) return
    let profileImageUrl = profile.image_url
    let profileImagePath = ""

    if (profileImageFile) {
      const { path, url } = await uploadProfileImage(profile, profileImageFile)
      profileImageUrl = url ?? profileImageUrl
      profileImagePath = path
    }

    const updatedProfile = await updateProfile(profile.id, {
      ...profile,
      display_name: displayName,
      profile_context: profileInstructions,
      image_url: profileImageUrl,
      image_path: profileImagePath
    })

    setProfile(updatedProfile)

    toast.success("Profile updated!")

    const providers = [
      "openai",
      "google",
      "azure",
      "anthropic",
      "mistral",
      "groq",
      "perplexity",
      "openrouter"
    ]

    providers.forEach(async provider => {
      let providerKey: keyof typeof profile

      if (provider === "google") {
        providerKey = "google_gemini_api_key"
      } else if (provider === "azure") {
        providerKey = "azure_openai_api_key"
      } else {
        providerKey = `${provider}_api_key` as keyof typeof profile
      }

      const models = LLM_LIST_MAP[provider]
      const envKeyActive = envKeyMap[provider]

      if (!envKeyActive) {
        const hasApiKey = !!updatedProfile[providerKey]

        if (provider === "openrouter") {
          if (hasApiKey && availableOpenRouterModels.length === 0) {
            const openrouterModels: OpenRouterLLM[] =
              await fetchOpenRouterModels()
            setAvailableOpenRouterModels(prev => {
              const newModels = openrouterModels.filter(
                model =>
                  !prev.some(prevModel => prevModel.modelId === model.modelId)
              )
              return [...prev, ...newModels]
            })
          } else {
            setAvailableOpenRouterModels([])
          }
        } else {
          if (hasApiKey && Array.isArray(models)) {
            setAvailableHostedModels(prev => {
              const newModels = models.filter(
                model =>
                  !prev.some(prevModel => prevModel.modelId === model.modelId)
              )
              return [...prev, ...newModels]
            })
          } else if (!hasApiKey && Array.isArray(models)) {
            setAvailableHostedModels(prev =>
              prev.filter(model => !models.includes(model))
            )
          }
        }
      }
    })

    setIsOpen(false)
    setDir(selectedDir)
    localStorage.setItem("dir", selectedDir)
    localStorage.setItem("locale", selectedLocale)
    if (pathname[3] === "/") {
      router.push(`/${selectedLocale}/${pathname.slice(4)}`)
    } else {
      router.push(`/${selectedLocale + pathname}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      buttonRef.current?.click()
    }
  }

  if (!profile) return null

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {profile.image_url ? (
          <Image
            className="hover:opacity-50 rounded cursor-pointer size-[34px]"
            src={profile.image_url + "?" + new Date().getTime()}
            height={34}
            width={34}
            alt={"Image"}
          />
        ) : (
          <Button size="icon" variant="ghost">
            <IconUser size={SIDEBAR_ICON_SIZE} />
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        dir={dir}
        className="flex flex-col justify-between"
        side={dir === "rtl" ? "right" : "left"}
        onKeyDown={handleKeyDown}
      >
        <div className="space-y-6 overflow-auto grow">
          <SheetHeader>
            <SheetTitle className="flex justify-between items-center">
              <div>{t("User Settings")}</div>

              <Button
                tabIndex={-1}
                className="text-xs"
                size="sm"
                onClick={handleSignOut}
              >
                <IconLogout className="mr-1" size={20} />
                {t("Logout")}
              </Button>
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-1">
            <Label>{t("Profile Image")}</Label>

            <ImagePicker
              src={profileImageSrc}
              image={profileImageFile}
              height={50}
              width={50}
              onSrcChange={setProfileImageSrc}
              onImageChange={setProfileImageFile}
            />
          </div>

          <div className="space-y-1">
            <Label>{t("Chat Display Name")}</Label>

            <Input
              placeholder={t("Chat display name...")}
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={PROFILE_DISPLAY_NAME_MAX}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-sm">
              {t(
                "What would you like the AI to know about you to provide better responses?"
              )}
            </Label>

            <TextareaAutosize
              value={profileInstructions}
              onValueChange={setProfileInstructions}
              placeholder={t("Profile context... (optional)")}
              minRows={6}
              maxRows={10}
            />

            <LimitDisplay
              used={profileInstructions.length}
              limit={PROFILE_CONTEXT_MAX}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-sm">{t("Language")}</Label>
            <DropdownMenu open={isLocaleOpen} onOpenChange={setIsLocaleOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  ref={inputRef}
                  className="flex justify-between items-center mb-4 w-full"
                  variant="outline"
                >
                  <div className="flex items-center">
                    {selectedLocale.toUpperCase()}
                  </div>
                  <IconChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                style={{ width: inputRef.current?.offsetWidth }}
              >
                <div className="max-h-[300px] overflow-auto">
                  {locales.map((locale: string) => (
                    <OptionItem
                      key={locale}
                      label={locale.toUpperCase()}
                      dir={dir}
                      onClick={() => onSelectLocale(locale)}
                    />
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-1">
            <Label className="text-sm">{t("Direction")}</Label>
            <DropdownMenu open={isDirOpen} onOpenChange={setIsDirOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  className="flex justify-between items-center mb-4 w-full"
                  variant="outline"
                >
                  <div className="flex items-center">
                    {selectedDir.toUpperCase()}
                  </div>
                  <IconChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                style={{ width: inputRef.current?.offsetWidth }}
              >
                <div className="max-h-[300px] overflow-auto">
                  <OptionItem
                    label="LTR"
                    onClick={() => onSelectDir("ltr")}
                    dir={dir}
                  />
                  <OptionItem
                    label="RTL"
                    onClick={() => onSelectDir("rtl")}
                    dir={dir}
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center">
            <ThemeSwitcher />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              {t("Cancel")}
            </Button>

            <Button ref={buttonRef} onClick={handleSave}>
              {t("Save")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
