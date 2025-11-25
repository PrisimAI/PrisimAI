import { useEffect, useRef, useState } from 'react'
import { DownloadSimple, ArrowClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import type { GeneratedImage } from '@/lib/types'

interface ImageGenerationProps {
  images: GeneratedImage[]
  onRegenerate: (prompt: string) => void
}

export function ImageGeneration({ images, onRegenerate }: ImageGenerationProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const previousImagesRef = useRef<GeneratedImage[]>([])

  // Cleanup blob URLs when images are removed from the list
  useEffect(() => {
    const previousImages = previousImagesRef.current
    const currentIds = new Set(images.map((img) => img.id))

    // Find removed images and revoke their blob URLs
    for (const prevImage of previousImages) {
      if (!currentIds.has(prevImage.id) && prevImage.url.startsWith('blob:')) {
        URL.revokeObjectURL(prevImage.url)
      }
    }

    previousImagesRef.current = images
  }, [images])

  // Cleanup all blob URLs on unmount
  useEffect(() => {
    return () => {
      for (const image of previousImagesRef.current) {
        if (image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url)
        }
      }
    }
  }, [])

  const handleDownload = async (url: string, imageId: string) => {
    setDownloadingId(imageId)
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      
      // Determine file extension based on blob type
      const extension = blob.type === 'image/svg+xml' ? 'svg' : 'png'
      
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `prism-ai-${Date.now()}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Failed to download image:', error)
      toast.error('Failed to download image. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  if (images.length === 0) {
    return null
  }

  return (
    <div className="space-y-6 p-6">
      {images.map((image) => (
        <Card key={image.id} className="overflow-hidden">
          <div className="relative">
            <img
              src={image.url}
              alt={image.prompt}
              className="h-auto w-full object-contain"
              loading="lazy"
            />
          </div>
          <div className="space-y-3 p-4">
            <p className="text-sm text-muted-foreground">{image.prompt}</p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleDownload(image.url, image.id)}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={downloadingId === image.id}
              >
                <DownloadSimple size={16} />
                {downloadingId === image.id ? 'Downloading...' : 'Download'}
              </Button>
              <Button
                onClick={() => onRegenerate(image.prompt)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ArrowClockwise size={16} />
                Regenerate
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
