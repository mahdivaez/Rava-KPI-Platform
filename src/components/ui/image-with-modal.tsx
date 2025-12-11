"use client"

import { useState } from "react"
import { ImageModal } from "@/components/ui/image-modal"
import { Loader2 } from "lucide-react"

interface ImageWithModalProps {
  src?: string | null
  alt: string
  className?: string
  style?: React.CSSProperties
  onClick?: (src: string) => void
  showClickIndicator?: boolean
}

export function ImageWithModal({
  src,
  alt,
  className = "",
  style = {},
  onClick,
  showClickIndicator = true
}: ImageWithModalProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [modalImageSrc, setModalImageSrc] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return null
    if (url.startsWith("http")) return url
    const normalized = url.startsWith("/") ? url : `/${url}`
    if (typeof window !== "undefined" && window.location?.origin) {
      return `${window.location.origin}${normalized}`
    }
    return normalized
  }

  const handleImageClick = () => {
    const resolvedUrl = resolveImageUrl(src)
    if (resolvedUrl && onClick) {
      onClick(resolvedUrl)
    }
  }

  const handleModalOpen = () => {
    const resolvedUrl = resolveImageUrl(src)
    if (resolvedUrl) {
      setModalImageSrc(resolvedUrl)
      setImageModalOpen(true)
    }
  }

  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const resolvedSrc = resolveImageUrl(src)

  if (!src || hasError) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300" style={style}>
        <div className="text-center p-4">
          <div className="text-gray-400 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 italic">
            {hasError ? "خطا در بارگذاری تصویر" : "تصویر موجود نیست"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative group">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="sr-only">در حال بارگذاری...</span>
          </div>
        )}
        
        <img
          src={resolvedSrc || undefined}
          alt={alt}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={style}
          onClick={onClick ? handleImageClick : handleModalOpen}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {showClickIndicator && !isLoading && !hasError && (
          <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg cursor-pointer" onClick={onClick ? handleImageClick : handleModalOpen} />
      </div>

      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageSrc={modalImageSrc}
        imageAlt={alt}
      />
    </>
  )
}
