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

    // Set canvas size
    const setSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setSize()
    window.addEventListener('resize', setSize)

    // Animation parameters
    let time = 0
    const waves: Array<{
      amplitude: number
      frequency: number
      speed: number
      offset: number
      color: string
    }> = [
      { amplitude: 40, frequency: 0.003, speed: 0.5, offset: 0, color: 'rgba(147, 51, 234, 0.15)' }, // Purple
      { amplitude: 50, frequency: 0.002, speed: 0.3, offset: Math.PI / 3, color: 'rgba(59, 130, 246, 0.12)' }, // Blue
      { amplitude: 35, frequency: 0.004, speed: 0.7, offset: Math.PI / 2, color: 'rgba(168, 85, 247, 0.1)' }, // Violet
      { amplitude: 45, frequency: 0.0025, speed: 0.4, offset: Math.PI, color: 'rgba(99, 102, 241, 0.13)' }, // Indigo
    ]

    // Metallic gradient
    const createMetallicGradient = (x: number, y: number, radius: number) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, 'rgba(226, 232, 240, 0.08)')
      gradient.addColorStop(0.5, 'rgba(148, 163, 184, 0.05)')
      gradient.addColorStop(1, 'rgba(71, 85, 105, 0.03)')
      return gradient
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background metallic gradient
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      bgGradient.addColorStop(0, 'rgba(30, 41, 59, 0.02)')
      bgGradient.addColorStop(0.5, 'rgba(51, 65, 85, 0.03)')
      bgGradient.addColorStop(1, 'rgba(30, 41, 59, 0.02)')
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

      // Add metallic blobs
      const numBlobs = 8
      for (let i = 0; i < numBlobs; i++) {
        const blobX = (canvas.width / numBlobs) * i + ((Math.sin(time * 0.3 + i) * canvas.width) / numBlobs) * 0.3
        const blobY =
          canvas.height / 2 + Math.sin(time * 0.4 + i * 0.5) * (canvas.height * 0.2) + Math.cos(time * 0.5 + i) * 50

        const radius = 80 + Math.sin(time * 0.6 + i) * 30

        ctx.beginPath()
        ctx.arc(blobX, blobY, radius, 0, Math.PI * 2)
        ctx.fillStyle = createMetallicGradient(blobX, blobY, radius)
        ctx.fill()
      }

      // Add shimmer effect
      const shimmerGradient = ctx.createLinearGradient(
        -canvas.width + ((time * 100) % (canvas.width * 2)),
        0,
        ((time * 100) % (canvas.width * 2)),
        canvas.height
      )
      shimmerGradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
      shimmerGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.03)')
      shimmerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

      ctx.fillStyle = shimmerGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      time += 0.01
      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)

    return () => {
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
