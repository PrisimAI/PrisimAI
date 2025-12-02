import { useEffect, useRef } from 'react'

interface LiquidMetalBackgroundProps {
  className?: string
  opacity?: number
}

export function LiquidMetalBackground({ className = '', opacity = 0.3 }: LiquidMetalBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Flag to track if component is still mounted (Bug #39)
    let isMounted = true

    // Set canvas size
    const setSize = () => {
      if (!isMounted) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setSize()
    window.addEventListener('resize', setSize)

    // Animation parameters - highly visible liquid metal effect
    let time = 0
    const waves: Array<{
      amplitude: number
      frequency: number
      speed: number
      offset: number
      color: string
    }> = [
      { amplitude: 80, frequency: 0.003, speed: 0.6, offset: 0, color: 'rgba(147, 51, 234, 0.35)' }, // Purple - much more visible
      { amplitude: 90, frequency: 0.002, speed: 0.4, offset: Math.PI / 3, color: 'rgba(59, 130, 246, 0.3)' }, // Blue
      { amplitude: 70, frequency: 0.004, speed: 0.8, offset: Math.PI / 2, color: 'rgba(168, 85, 247, 0.28)' }, // Violet
      { amplitude: 85, frequency: 0.0025, speed: 0.5, offset: Math.PI, color: 'rgba(99, 102, 241, 0.32)' }, // Indigo
      { amplitude: 75, frequency: 0.0035, speed: 0.65, offset: Math.PI / 4, color: 'rgba(124, 58, 237, 0.25)' }, // Additional purple wave
    ]

    // Metallic gradient - much more visible
    const createMetallicGradient = (x: number, y: number, radius: number) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, 'rgba(226, 232, 240, 0.25)')
      gradient.addColorStop(0.5, 'rgba(148, 163, 184, 0.18)')
      gradient.addColorStop(1, 'rgba(71, 85, 105, 0.12)')
      return gradient
    }

    // Animation loop
    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background metallic gradient - more visible and animated
      const bgGradient = ctx.createLinearGradient(
        Math.sin(time * 0.1) * canvas.width * 0.3,
        Math.cos(time * 0.15) * canvas.height * 0.3,
        canvas.width + Math.cos(time * 0.1) * canvas.width * 0.3,
        canvas.height + Math.sin(time * 0.15) * canvas.height * 0.3
      )
      bgGradient.addColorStop(0, 'rgba(30, 41, 59, 0.08)')
      bgGradient.addColorStop(0.5, 'rgba(51, 65, 85, 0.12)')
      bgGradient.addColorStop(1, 'rgba(30, 41, 59, 0.08)')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw flowing waves
      waves.forEach((wave, index) => {
        ctx.beginPath()
        ctx.moveTo(0, canvas.height / 2)

        for (let x = 0; x <= canvas.width; x++) {
          const y =
            canvas.height / 2 +
            Math.sin(x * wave.frequency + time * wave.speed + wave.offset) * wave.amplitude +
            Math.sin(x * wave.frequency * 2 + time * wave.speed * 1.5) * (wave.amplitude * 0.5)

          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.lineTo(canvas.width, canvas.height)
        ctx.lineTo(0, canvas.height)
        ctx.closePath()

        ctx.fillStyle = wave.color
        ctx.fill()
      })

      // Add metallic blobs - more dynamic and visible
      const numBlobs = 12
      for (let i = 0; i < numBlobs; i++) {
        const blobX = (canvas.width / numBlobs) * i + ((Math.sin(time * 0.4 + i) * canvas.width) / numBlobs) * 0.4
        const blobY =
          canvas.height / 2 + Math.sin(time * 0.5 + i * 0.7) * (canvas.height * 0.25) + Math.cos(time * 0.6 + i) * 60

        const radius = 100 + Math.sin(time * 0.7 + i) * 40

        ctx.beginPath()
        ctx.arc(blobX, blobY, radius, 0, Math.PI * 2)
        ctx.fillStyle = createMetallicGradient(blobX, blobY, radius)
        ctx.fill()
      }

      // Add shimmer effect - highly visible and faster
      const shimmerGradient = ctx.createLinearGradient(
        -canvas.width + ((time * 150) % (canvas.width * 2)),
        0,
        ((time * 150) % (canvas.width * 2)),
        canvas.height
      )
      shimmerGradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
      shimmerGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.12)')
      shimmerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

      ctx.fillStyle = shimmerGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      time += 0.015 // Slightly faster animation
      
      // Only continue animation if still mounted
      if (isMounted) {
        animationId = requestAnimationFrame(animate)
      }
    }

    // Start animation
    animationId = requestAnimationFrame(animate)

    return () => {
      isMounted = false
      window.removeEventListener('resize', setSize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    />
  )
}
