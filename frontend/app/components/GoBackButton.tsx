'use client'

import {useRouter} from 'next/navigation'
import {ArrowLeft} from 'lucide-react'

export default function GoBackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-black/70 px-10 py-4 cursor-pointer hover:font-bold transition-colors duration-200 group"
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
      <span className="text-sm font-medium">Terug</span>
    </button>
  )
}
