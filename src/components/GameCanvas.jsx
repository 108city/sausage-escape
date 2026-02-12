import { useRef, useEffect, useState } from 'react'

const GameCanvas = ({ onGameOver, onScore }) => {
    const canvasRef = useRef(null)
    const [gameOver, setGameOver] = useState(false)

    // Game state refs
    const sausageY = useRef(0)
    const sausageVelocity = useRef(0)
    const sausageRotation = useRef(0)
    const isAntiGrav = useRef(false)
    const isDashing = useRef(false)
    const obstacles = useRef([])
    const frameCount = useRef(0)
    const canvasSize = useRef({ width: 0, height: 0 })

    const gravity = 0.4
    const antiGravForce = -0.8
    const dashForce = 15
    const sausageWidth = 60
    const sausageHeight = 25

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            canvasSize.current = { width: canvas.width, height: canvas.height }
            sausageY.current = canvas.height / 2
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        const handleInputDown = (e) => {
            if (e.type === 'keydown' && e.code !== 'Space') return
            isAntiGrav.current = true
            isDashing.current = false
        }

        const handleInputUp = (e) => {
            if ((e.type === 'keyup' && e.code === 'Space') || e.type === 'touchend') {
                if (isAntiGrav.current) {
                    isAntiGrav.current = false
                    isDashing.current = true // Sizzle Dash!
                    sausageVelocity.current = dashForce
                }
            }
        }

        window.addEventListener('keydown', handleInputDown)
        window.addEventListener('keyup', handleInputUp)
        window.addEventListener('touchstart', handleInputDown)
        window.addEventListener('touchend', handleInputUp)

        let animationFrameId

        const render = () => {
            if (gameOver) return

            // Clear with kitchen-tile-like background pattern
            context.fillStyle = '#1a1a1a'
            context.fillRect(0, 0, canvas.width, canvas.height)

            // Draw Grid/Tiles
            context.strokeStyle = '#333'
            context.lineWidth = 1
            for (let x = frameCount.current % 50; x < canvas.width; x += 50) {
                context.beginPath()
                context.moveTo(canvas.width - x, 0)
                context.lineTo(canvas.width - x, canvas.height)
                context.stroke()
            }
            for (let y = 0; y < canvas.height; y += 50) {
                context.beginPath()
                context.moveTo(0, y)
                context.lineTo(canvas.width, y)
                context.stroke()
            }

            // Physics Logic
            if (isAntiGrav.current) {
                sausageVelocity.current += antiGravForce
                sausageRotation.current += 0.08 // Spinning lazily
            } else {
                sausageVelocity.current += gravity
                // Pull back rotation towards velocity direction
                const targetRot = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, sausageVelocity.current * 0.1))
                sausageRotation.current += (targetRot - sausageRotation.current) * 0.1
            }

            sausageY.current += sausageVelocity.current

            // Collision with floor/ceiling
            if (sausageY.current > canvas.height - sausageHeight) {
                sausageY.current = canvas.height - sausageHeight
                sausageVelocity.current = 0
                if (isDashing.current) {
                    // Screen shake or effect could go here
                }
                isDashing.current = false
            }
            if (sausageY.current < 0) {
                sausageY.current = 0
                sausageVelocity.current = 0
            }

            // Obstacles
            frameCount.current++
            if (frameCount.current % 120 === 0) {
                const type = Math.random() > 0.7 ? 'syrup' : 'pipe'
                const gap = 250
                const gapPosition = Math.random() * (canvas.height - gap - 200) + 100
                obstacles.current.push({
                    x: canvas.width,
                    gapTop: gapPosition,
                    gapBottom: gapPosition + gap,
                    width: 80,
                    passed: false,
                    type: type
                })
            }

            obstacles.current.forEach((obs) => {
                obs.x -= 5

                if (obs.type === 'syrup') {
                    context.fillStyle = 'rgba(243, 156, 18, 0.6)'
                    context.fillRect(obs.x, canvas.height - 40, obs.width, 40)
                } else {
                    // "Kitchen Utensil" or pipe
                    context.fillStyle = '#95a5a6'
                    context.fillRect(obs.x, 0, obs.width, obs.gapTop)
                    context.fillRect(obs.x, obs.gapBottom, obs.width, canvas.height - obs.gapBottom)
                }

                // Collision
                const sausageX = 150
                if (
                    sausageX + sausageWidth > obs.x &&
                    sausageX < obs.x + obs.width
                ) {
                    if (obs.type === 'pipe') {
                        if (sausageY.current < obs.gapTop || sausageY.current + sausageHeight > obs.gapBottom) {
                            setGameOver(true)
                            onGameOver()
                        }
                    } else if (obs.type === 'syrup' && sausageY.current > canvas.height - 80) {
                        obs.x += 1 // Slow down effect
                    }
                }

                if (!obs.passed && obs.x < sausageX) {
                    obs.passed = true
                    onScore()
                }
            })

            obstacles.current = obstacles.current.filter(obs => obs.x + obs.width > 0)

            // Draw Sausage
            context.save()
            context.translate(150 + sausageWidth / 2, sausageY.current + sausageHeight / 2)
            context.rotate(sausageRotation.current)

            // Sausage segments (sentient link)
            const segments = 3
            const segmentWidth = sausageWidth / segments
            for (let i = 0; i < segments; i++) {
                context.fillStyle = isDashing.current ? '#f1c40f' : '#e74c3c'
                context.beginPath()
                context.roundRect(
                    -sausageWidth / 2 + i * segmentWidth + 2,
                    -sausageHeight / 2,
                    segmentWidth - 4,
                    sausageHeight,
                    10
                )
                context.fill()

                // Link string
                if (i < segments - 1) {
                    context.strokeStyle = '#c0392b'
                    context.lineWidth = 4
                    context.beginPath()
                    context.moveTo(-sausageWidth / 2 + (i + 1) * segmentWidth - 2, 0)
                    context.lineTo(-sausageWidth / 2 + (i + 1) * segmentWidth + 2, 0)
                    context.stroke()
                }
            }

            // Eyes (sentient!)
            context.fillStyle = 'white'
            context.beginPath()
            context.arc(sausageWidth / 2 - 10, -5, 4, 0, Math.PI * 2)
            context.fill()
            context.fillStyle = 'black'
            context.beginPath()
            context.arc(sausageWidth / 2 - 8, -5, 2, 0, Math.PI * 2)
            context.fill()

            // Glow if Anti-Grav or Dashing
            if (isAntiGrav.current) {
                context.shadowBlur = 15
                context.shadowColor = '#3498db'
            } else if (isDashing.current) {
                context.shadowBlur = 20
                context.shadowColor = '#f1c40f'
            }

            context.restore()

            animationFrameId = window.requestAnimationFrame(render)
        }

        render()

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('keydown', handleInputDown)
            window.removeEventListener('keyup', handleInputUp)
            window.removeEventListener('touchstart', handleInputDown)
            window.removeEventListener('touchend', handleInputUp)
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [gameOver, onGameOver, onScore])

    return (
        <canvas
            ref={canvasRef}
            style={{ display: 'block', width: '100vw', height: '100vh' }}
        />
    )
}

export default GameCanvas
