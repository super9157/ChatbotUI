import { LLM } from "@/types"

const DALLE_PLATFORM_LINK = "https://openai.com/dall-e-3/"
const STABLE_DIFFUSION_PLATFORM_LINK = "https://stablediffusionapi.com/docs/"

const DALL_E: LLM = {
  modelId: "dall-e-3",
  modelName: "Dall-E-3",
  provider: "image",
  hostedId: "dall-e-3",
  platformLink: DALLE_PLATFORM_LINK,
  imageInput: false
}

const STABLE_DIFFUSION: LLM = {
  modelId: "stable-diffusion",
  modelName: "Stable-Diffusion",
  provider: "image",
  hostedId: "stable-diffusion",
  platformLink: STABLE_DIFFUSION_PLATFORM_LINK,
  imageInput: false
}

export const IMAGE_LLM_LIST: LLM[] = [DALL_E, STABLE_DIFFUSION]
