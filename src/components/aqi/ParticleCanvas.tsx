import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  life: number
  maxLife: number
}

interface ParticleCanvasProps {
  rgb: string        // "r,g,b"
  count: number
  speed: number
  animKey: string    // forces re-init when level changes
}

export function ParticleCanvas({ rgb, count, speed, animKey }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function mkParticle(): Particle {
      const maxLife = 180 + Math.random() * 220
      return {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        vx: (Math.random() - 0.5) * speed * 2,
        vy: (Math.random() - 0.5) * speed * 2,
        radius: 0.8 + Math.random() * 2.5,
        life: Math.random() * maxLife,
        maxLife,
      }
    }

    const particles: Particle[] = Array.from({ length: count }, mkParticle)

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.life++
        p.x += p.vx
        p.y += p.vy

        if (p.x < -20) p.x = canvas.width + 20
        if (p.x > canvas.width + 20) p.x = -20
        if (p.y < -20) p.y = canvas.height + 20
        if (p.y > canvas.height + 20) p.y = -20

        if (p.life >= p.maxLife) {
          particles[i] = mkParticle()
          particles[i].life = 0
          continue
        }

        const prog = p.life / p.maxLife
        const alpha = prog < 0.15
          ? prog / 0.15
          : prog > 0.80
          ? (1 - prog) / 0.20
          : 1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb},${(alpha * 0.75).toFixed(2)})`
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [rgb, count, speed, animKey])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}
