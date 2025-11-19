import { DownloadSimple, ArrowClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { GeneratedImage } from '@/lib/types'

interface ImageGenerationProps {
  images: GeneratedImage[]
  onRegenerate: (prompt: string) => void
}

export function ImageGeneration({ images, onRegenerate }: ImageGenerationProps) {
  const handleDownload = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `prism-ai-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Failed to download image:', error)
    }
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
            />
          </div>
          <div className="space-y-3 p-4">
            <p className="text-sm text-muted-foreground">{image.prompt}</p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleDownload(image.url, image.prompt)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <DownloadSimple size={16} />
                Download
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
