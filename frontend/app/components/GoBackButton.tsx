'use client'

import {useRouter} from 'next/navigation'
import {ArrowLeft} from 'lucide-react'

export default function GoBackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="text-black/70 pr-5 cursor-pointer hover:font-bold transition-colors duration-200 group"
      aria-label="Go back"
    >
      <ArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200 text-white" />
    </button>
  )
}
