import { ChatbotUIContext } from "@/context/context"
import { getFileFromStorage } from "@/db/storage/files"
import useHotkey from "@/lib/hooks/use-hotkey"
import { cn } from "@/lib/utils"
import { ChatFile, MessageImage } from "@/types"
import {
  IconCircleFilled,
  IconFileFilled,
  IconFileTypeCsv,
  IconFileTypeDocx,
  IconFileTypePdf,
  IconFileTypeTxt,
  IconJson,
  IconLoader2,
  IconMarkdown,
  IconX
} from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useState } from "react"
import { Button } from "../ui/button"
import { FilePreview } from "../ui/file-preview"
import { WithTooltip } from "../ui/with-tooltip"
import { ChatRetrievalSettings } from "./chat-retrieval-settings"
import { useTranslation } from "react-i18next"

interface ChatFilesDisplayProps {}

export const ChatFilesDisplay: FC<ChatFilesDisplayProps> = ({}) => {
  const { t } = useTranslation()
  useHotkey("f", () => setShowFilesDisplay(prev => !prev))
  useHotkey("e", () => setUseRetrieval(prev => !prev))

  const {
    files,
    newMessageImages,
    setNewMessageImages,
    newMessageFiles,
    setNewMessageFiles,
    setShowFilesDisplay,
    showFilesDisplay,
    chatFiles,
    chatImages,
    setChatImages,
    setChatFiles,
    setUseRetrieval
  } = useContext(ChatbotUIContext)

  const [selectedFile, setSelectedFile] = useState<ChatFile | null>(null)
  const [selectedImage, setSelectedImage] = useState<MessageImage | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const messageImages = [
    ...newMessageImages.filter(
      image =>
        !chatImages.some(chatImage => chatImage.messageId === image.messageId)
    )
  ]

  const combinedChatFiles = [
    ...newMessageFiles.filter(
      file => !chatFiles.some(chatFile => chatFile.id === file.id)
    ),
    ...chatFiles
  ]

  const combinedMessageFiles = [...messageImages, ...combinedChatFiles]

  const getLinkAndView = async (file: ChatFile) => {
    const fileRecord = files.find(f => f.id === file.id)

    if (!fileRecord) return

    const link = await getFileFromStorage(fileRecord.file_path)
    window.open(link, "_blank")
  }

  return showFilesDisplay && combinedMessageFiles.length > 0 ? (
    <>
      {showPreview && selectedImage && (
        <FilePreview
          type="image"
          item={selectedImage}
          isOpen={showPreview}
          onOpenChange={(isOpen: boolean) => {
            setShowPreview(isOpen)
            setSelectedImage(null)
          }}
        />
      )}

      {showPreview && selectedFile && (
        <FilePreview
          type="file"
          item={selectedFile}
          isOpen={showPreview}
          onOpenChange={(isOpen: boolean) => {
            setShowPreview(isOpen)
            setSelectedFile(null)
          }}
        />
      )}

      <div className="space-y-2">
        <div className="flex justify-center items-center w-full">
          <Button
            className="flex space-x-2 w-[140px] h-[32px]"
            onClick={() => setShowFilesDisplay(false)}
          >
            <RetrievalToggle />

            <div>{t("Hide files")}</div>

            <div onClick={e => e.stopPropagation()}>
              <ChatRetrievalSettings />
            </div>
          </Button>
        </div>

        <div className="overflow-auto">
          <div className="flex gap-2 pt-2 overflow-auto">
            {messageImages.map((image, index) => (
              <div
                key={index}
                className="relative flex items-center space-x-4 hover:opacity-50 rounded-xl h-[64px] cursor-pointer"
              >
                <Image
                  className="rounded"
                  // Force the image to be 56px by 56px
                  style={{
                    minWidth: "56px",
                    minHeight: "56px",
                    maxHeight: "56px",
                    maxWidth: "56px"
                  }}
                  src={image.base64} // Preview images will always be base64
                  alt="File image"
                  width={56}
                  height={56}
                  onClick={() => {
                    setSelectedImage(image)
                    setShowPreview(true)
                  }}
                />

                <IconX
                  className="top-[-2px] right-[-6px] absolute flex justify-center items-center border-DEFAULT border-primary bg-muted-foreground hover:bg-white hover:border-red-500 rounded-full text-[10px] hover:text-red-500 cursor-pointer size-5"
                  onClick={e => {
                    e.stopPropagation()
                    setNewMessageImages(
                      newMessageImages.filter(
                        f => f.messageId !== image.messageId
                      )
                    )
                    setChatImages(
                      chatImages.filter(f => f.messageId !== image.messageId)
                    )
                  }}
                />
              </div>
            ))}

            {combinedChatFiles.map((file, index) =>
              file.id === "loading" ? (
                <div
                  key={index}
                  className="relative flex items-center space-x-4 border-2 px-4 py-3 rounded-xl h-[64px]"
                >
                  <div className="bg-blue-500 p-2 rounded">
                    <IconLoader2 className="animate-spin" />
                  </div>

                  <div className="text-sm truncate">
                    <div className="truncate">{file.name}</div>
                    <div className="opacity-50 truncate">{file.type}</div>
                  </div>
                </div>
              ) : (
                <div
                  key={file.id}
                  className="relative flex items-center space-x-4 border-2 hover:opacity-50 px-4 py-3 rounded-xl h-[64px] cursor-pointer"
                  onClick={() => getLinkAndView(file)}
                >
                  <div className="bg-blue-500 p-2 rounded">
                    {(() => {
                      let fileExtension = file.type.includes("/")
                        ? file.type.split("/")[1]
                        : file.type

                      switch (fileExtension) {
                        case "pdf":
                          return <IconFileTypePdf />
                        case "markdown":
                          return <IconMarkdown />
                        case "txt":
                          return <IconFileTypeTxt />
                        case "json":
                          return <IconJson />
                        case "csv":
                          return <IconFileTypeCsv />
                        case "docx":
                          return <IconFileTypeDocx />
                        default:
                          return <IconFileFilled />
                      }
                    })()}
                  </div>

                  <div className="text-sm truncate">
                    <div className="truncate">{file.name}</div>
                  </div>

                  <IconX
                    className="top-[-6px] right-[-6px] absolute flex justify-center items-center border-DEFAULT border-primary bg-muted-foreground hover:bg-white hover:border-red-500 rounded-full text-[10px] hover:text-red-500 cursor-pointer size-5"
                    onClick={e => {
                      e.stopPropagation()
                      setNewMessageFiles(
                        newMessageFiles.filter(f => f.id !== file.id)
                      )
                      setChatFiles(chatFiles.filter(f => f.id !== file.id))
                    }}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  ) : (
    combinedMessageFiles.length > 0 && (
      <div className="flex justify-center items-center space-x-2 w-full">
        <Button
          className="flex space-x-2 w-[140px] h-[32px]"
          onClick={() => setShowFilesDisplay(true)}
        >
          <RetrievalToggle />

          <div>
            {" "}
            {t("View")} {combinedMessageFiles.length} {t("file")}
            {combinedMessageFiles.length > 1 ? "s" : ""}
          </div>

          <div onClick={e => e.stopPropagation()}>
            <ChatRetrievalSettings />
          </div>
        </Button>
      </div>
    )
  )
}

const RetrievalToggle = ({}) => {
  const { useRetrieval, setUseRetrieval } = useContext(ChatbotUIContext)

  return (
    <div className="flex items-center">
      <WithTooltip
        delayDuration={0}
        side="top"
        display={
          <div>
            {useRetrieval
              ? "File retrieval is enabled on the selected files for this message. Click the indicator to disable."
              : "Click the indicator to enable file retrieval for this message."}
          </div>
        }
        trigger={
          <IconCircleFilled
            className={cn(
              "p-1",
              useRetrieval ? "text-green-500" : "text-red-500",
              useRetrieval ? "hover:text-green-200" : "hover:text-red-200"
            )}
            size={24}
            onClick={e => {
              e.stopPropagation()
              setUseRetrieval(prev => !prev)
            }}
          />
        }
      />
    </div>
  )
}
