import { useEffect, useRef, useState } from 'react'
import { DownloadSimple, ArrowClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import type { GeneratedVideo } from '@/lib/types'

interface VideoGenerationProps {
  videos: GeneratedVideo[]
  onRegenerate: (prompt: string) => void
}

export function VideoGeneration({ videos, onRegenerate }: VideoGenerationProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const previousVideosRef = useRef<GeneratedVideo[]>([])

  // Cleanup blob URLs when videos are removed from the list
  useEffect(() => {
    const previousVideos = previousVideosRef.current
    const currentIds = new Set(videos.map((vid) => vid.id))

    // Find removed videos and revoke their blob URLs
    for (const prevVideo of previousVideos) {
      if (!currentIds.has(prevVideo.id) && prevVideo.url.startsWith('blob:')) {
        URL.revokeObjectURL(prevVideo.url)
      }
    }

    previousVideosRef.current = videos
  }, [videos])

  // Cleanup all blob URLs on unmount
  useEffect(() => {
    return () => {
      for (const video of previousVideosRef.current) {
        if (video.url.startsWith('blob:')) {
          URL.revokeObjectURL(video.url)
        }
      }
    }
  }, [])

  // Helper function to get file extension from MIME type
  const getExtensionFromMimeType = (mimeType: string): string => {
    const mimeToExtension: Record<string, string> = {
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/ogg': 'ogg',
      'video/quicktime': 'mov',
      'video/x-msvideo': 'avi',
    }
    return mimeToExtension[mimeType] || 'mp4'
  }

  const handleDownload = async (url: string, videoId: string) => {
    setDownloadingId(videoId)
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch video')
      }
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      
      // Determine file extension based on blob MIME type
      const extension = getExtensionFromMimeType(blob.type)
      
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `prism-ai-video-${Date.now()}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Failed to download video:', error)
      toast.error('Failed to download video. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  if (videos.length === 0) {
    return null
  }

  return (
    <div className="space-y-6 p-6">
      {videos.map((video) => (
        <Card key={video.id} className="overflow-hidden">
          <div className="relative">
            <video
              src={video.url}
              controls
              className="h-auto w-full object-contain"
              preload="metadata"
            />
          </div>
          <div className="space-y-3 p-4">
            <p className="text-sm text-muted-foreground">{video.prompt}</p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleDownload(video.url, video.id)}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={downloadingId === video.id}
              >
                <DownloadSimple size={16} />
                {downloadingId === video.id ? 'Downloading...' : 'Download'}
              </Button>
              <Button
                onClick={() => onRegenerate(video.prompt)}
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
