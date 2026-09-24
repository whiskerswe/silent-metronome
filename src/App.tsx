import { useEffect, useRef, useState } from 'react'
import './App.css'

const DEFAULT_BPM = 80
const MIN_BPM = 40
const MAX_BPM = 208

const MAX_ANGLE = Math.PI / 6
const ARM_LENGTH = 270
const TRAIL_DURATION = 350

const PENDULUM_COLOR = '#D3B4AA'

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

  const [bpm, setBpm] = useState(DEFAULT_BPM)
  const bpmRef = useRef(DEFAULT_BPM)

  function handleBpmChange(value: number) {
    setBpm(value)
    bpmRef.current = value
  }

  const getTempoName = (bpm: number): string => {
    if (bpm < 50) return 'Largo'
    if (bpm < 60) return 'Larghetto'
    if (bpm < 72) return 'Adagio'
    if (bpm < 84) return 'Andante'
    if (bpm < 96) return 'Moderato'
    if (bpm < 112) return 'Allegretto'
    if (bpm < 144) return 'Allegro'
    if (bpm < 176) return 'Vivace'
    return 'Presto'
  };

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

    ctx.clearRect(0, 0, width, height)
    trailCtx.clearRect(
        0,
        0,
        trailCanvas.width,
        trailCanvas.height
    )

    const pivotX = width / 2
    const pivotY = height - 25

    const trail: TrailFrame[] = []

    let animationId: number
    let lastTime = performance.now()
    let phase = 0

    function draw(now: number) {
      if (!ctx || !trailCtx) return

      const deltaTime = now - lastTime
      lastTime = now

      // Advance the phase using the current BPM.
      // This lets the speed change without restarting the animation.
      phase +=
          (deltaTime * bpmRef.current * Math.PI) / 60000

      ctx.clearRect(0, 0, width, height)

      const angle = MAX_ANGLE * Math.cos(phase)

      trail.push({ angle, time: now })

      while (
          trail.length > 0 &&
          now - trail[0].time > TRAIL_DURATION
          ) {
        trail.shift()
      }

      // Draw the soft fading trail.
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
            opacity * 0.006
        )

        ctx.lineWidth = 4
        ctx.lineCap = 'round'
        ctx.stroke()
      }

      const tipX =
          pivotX + Math.sin(angle) * ARM_LENGTH

      const tipY =
          pivotY - Math.cos(angle) * ARM_LENGTH

      // Fade the persistent trail.
      trailCtx.save()

      trailCtx.globalCompositeOperation = 'destination-out'
      trailCtx.fillStyle = 'rgba(0, 0, 0, 0.045)'
      trailCtx.fillRect(0, 0, width, height)

      trailCtx.restore()

      // Add current arm position to the trail.
      trailCtx.beginPath()
      trailCtx.moveTo(pivotX, pivotY)
      trailCtx.lineTo(tipX, tipY)

      trailCtx.strokeStyle = withOpacity(
          PENDULUM_COLOR,
          0.08
      )

      trailCtx.lineWidth = 5
      trailCtx.lineCap = 'round'
      trailCtx.stroke()

      // Draw the current arm.
      ctx.beginPath()
      ctx.moveTo(pivotX, pivotY)
      ctx.lineTo(tipX, tipY)

      ctx.strokeStyle = PENDULUM_COLOR
      ctx.lineWidth = 10
      ctx.lineCap = 'round'
      ctx.stroke()

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

      trailCtx.clearRect(
          0,
          0,
          trailCanvas.width,
          trailCanvas.height
      )
    }
  }, [])

  return (
      <main className="app">
        <div className="metronome-layout">
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

          <div className="tempo-control">
            <div className="tempo-value">
              <input
                  className="tempo-input"
                  type="number"
                  min={MIN_BPM}
                  max={MAX_BPM}
                  value={bpm}
                  onChange={(event) => {
                    const value = Number(event.target.value)

                    if (
                        Number.isFinite(value) &&
                        value >= MIN_BPM &&
                        value <= MAX_BPM
                    ) {
                      handleBpmChange(value)
                    }
                  }}
                  aria-label="Tempo in BPM"
              />
              <span className="tempo-unit">BPM</span>
            </div>

            <input
                className="tempo-slider"
                type="range"
                min={MIN_BPM}
                max={MAX_BPM}
                step={1}
                value={bpm}
                onChange={(event) =>
                    handleBpmChange(Number(event.target.value))
                }
                aria-label="Tempo"
            />

            <div className="tempo-name">
              {getTempoName(bpm)}
            </div>
          </div>
        </div>
      </main>
  )
}

export default App