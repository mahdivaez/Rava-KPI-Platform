"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

interface ScoreSelectorProps {
  value: number | undefined
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

export function ScoreSelector({
  value,
  onChange,
  min = 1,
  max = 5,
  className = ""
}: ScoreSelectorProps) {
  const currentValue = value || min

  const decrease = () => {
    if (currentValue > min) {
      onChange(currentValue - 1)
    }
  }

  const increase = () => {
    if (currentValue < max) {
      onChange(currentValue + 1)
    }
  }

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={decrease}
        disabled={currentValue <= min}
        className="w-10 h-10 p-0 border-2 border-nude-300 hover:border-nude-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Minus className="w-4 h-4" />
      </Button>

      <div className="flex items-center justify-center w-12 h-12 border-2 border-nude-300 rounded-lg bg-white">
        <span className="text-lg font-bold text-nude-900">
          {currentValue}
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={increase}
        disabled={currentValue >= max}
        className="w-10 h-10 p-0 border-2 border-nude-300 hover:border-nude-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  )
}