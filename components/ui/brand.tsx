"use client"

import Link from "next/link"
import Image from "next/image"
import { FC } from "react"

export const Brand: FC = () => {
  return (
    <Link
      className="flex flex-col items-center hover:opacity-50 cursor-pointer"
      href="#"
      rel="noopener noreferrer"
    >
      <div className="mb-2">
        <Image src="/logo.png" width={128} height={128} alt="logo" />
      </div>

      <div className="font-bold text-2xl tracking-wide">ChatGPT.co.il</div>
    </Link>
  )
}
