"use client"

import { Brand } from "@/components/ui/brand"
import { IconArrowRight } from "@tabler/icons-react"
import Link from "next/link"

export default function HomePage({ params }: { params: { locale: string } }) {
  return (
    <div className="flex flex-col justify-center items-center gap-6 size-full">
      <Brand />

      <Link
        className="flex justify-center items-center bg-blue-500 mt-4 p-2 rounded-md w-[200px] font-semibold"
        href={`/${params.locale}/login`}
      >
        Start Chatting
        <IconArrowRight className="ml-1" size={20} />
      </Link>
    </div>
  )
}
