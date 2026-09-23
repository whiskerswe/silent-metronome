import { useEffect, useRef } from 'react'
import './App.css'

const BPM = 80
const MAX_ANGLE = Math.PI / 6
const ARM_LENGTH = 200
const TRAIL_DURATION = 350

// Change this to change the color of the pendulum and its entire trail.
const PENDULUM_COLOR = '#CDA9A2'

type TrailFrame = {
  angle: number
  time: number
}

function withOpacity(hex: string, opacity: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trailCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const trailCanvas = trailCanvasRef.current
    if (!trailCanvas) return

    const trailCtx = trailCanvas.getContext('2d')
    if (!trailCtx) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Make sure no pixels from a previous animation survive.
    ctx.clearRect(0, 0, width, height)
    trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height)

    const pivotX = width / 2
    const pivotY = height - 25

    const trail: TrailFrame[] = []
    const startTime = performance.now()

    let animationId: number

    function draw(now: number) {
      if (!ctx || !trailCtx) return

      ctx.clearRect(0, 0, width, height)

      const beatDuration = 60000 / BPM
      const phase =
          ((now - startTime) / beatDuration) * Math.PI

      const angle = MAX_ANGLE * Math.cos(phase)

      trail.push({ angle, time: now })

      while (
          trail.length > 0 &&
          now - trail[0].time > TRAIL_DURATION
          ) {
        trail.shift()
      }

      // Draw a soft, fading trail behind the pendulum.
      for (const frame of trail) {
        const age = now - frame.time
        const opacity = Math.max(
            0,
            1 - age / TRAIL_DURATION
        )

        const x =
            pivotX + Math.sin(frame.angle) * ARM_LENGTH

        const y =
            pivotY - Math.cos(frame.angle) * ARM_LENGTH

        ctx.beginPath()
        ctx.moveTo(pivotX, pivotY)
        ctx.lineTo(x, y)

        ctx.strokeStyle = withOpacity(
            PENDULUM_COLOR,
            opacity * 0.012
        )

        ctx.lineWidth = 4
        ctx.lineCap = 'round'
        ctx.stroke()
      }

      // Current pendulum position.
      const tipX =
          pivotX + Math.sin(angle) * ARM_LENGTH

      const tipY =
          pivotY - Math.cos(angle) * ARM_LENGTH

      // Gradually erase the existing persistent trail.
      trailCtx.save()
      trailCtx.globalCompositeOperation = 'destination-out'
      trailCtx.fillStyle = 'rgba(0, 0, 0, 0.045)'
      trailCtx.fillRect(0, 0, width, height)
      trailCtx.restore()

      // Add the current arm position to the persistent trail.
      trailCtx.beginPath()
      trailCtx.moveTo(pivotX, pivotY)
      trailCtx.lineTo(tipX, tipY)

      trailCtx.strokeStyle = withOpacity(
          PENDULUM_COLOR,
          0.18
      )
      trailCtx.lineWidth = 5
      trailCtx.lineCap = 'round'
      trailCtx.stroke()

      // Draw the current arm.
      ctx.beginPath()
      ctx.moveTo(pivotX, pivotY)
      ctx.lineTo(tipX, tipY)

      ctx.strokeStyle = PENDULUM_COLOR
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.stroke()

      // Draw the glowing tip.
      ctx.beginPath()
      ctx.arc(tipX, tipY, 7, 0, Math.PI * 2)

      ctx.fillStyle = PENDULUM_COLOR
      ctx.shadowColor = PENDULUM_COLOR
      ctx.shadowBlur = 20
      ctx.fill()

      // Reset shadow before drawing anything else.
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0

      // Draw the pivot.
      ctx.beginPath()
      ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2)

      ctx.fillStyle = PENDULUM_COLOR
      ctx.fill()

      animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationId)
      ctx.clearRect(0, 0, width, height)
      trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height)
    }
  }, [])

  return (
      <main className="app">
        <div className="metronome">
          <canvas
              ref={trailCanvasRef}
              width={400}
              height={300}
              className="trail-canvas"
          />
          <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="pendulum-canvas"
          />
        </div>
      </main>
  )
}

export default App