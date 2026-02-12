import { useRef, useEffect, useState } from 'react'

const GameCanvas = ({ disturbance, onDisturb, onGameOver, onWin, activeAttack }) => {
    const canvasRef = useRef(null)
    const [isGameOver, setIsGameOver] = useState(false)

    // Game state refs
    const sausagePos = useRef({ x: 0, y: 0 })
    const sausageRot = useRef(0)
    const keys = useRef({})
    const particles = useRef([])
    const frameCount = useRef(0)
    const humanState = useRef('sleeping') // sleeping, tossing, awake
    const humanReactionTimer = useRef(0)

    const sausageSize = { w: 60, h: 25 }

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            sausagePos.current = { x: canvas.width / 4, y: canvas.height / 2 + 50 }
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase()
            keys.current[key] = true
            if (key === 'f') triggerAttack('fart')
            if (key === 's') triggerAttack('snore')
            if (key === 'c') triggerAttack('cold-feet')
        }
        const handleKeyUp = (e) => keys.current[e.key.toLowerCase()] = false
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        const triggerAttack = (type) => {
            if (isGameOver) return
            if (type === 'fart') {
                for (let i = 0; i < 25; i++) {
                    particles.current.push({
                        x: sausagePos.current.x,
                        y: sausagePos.current.y,
                        vx: (Math.random() - 0.5) * 3,
                        vy: (Math.random() - 0.5) * 3,
                        size: Math.random() * 20 + 5,
                        color: `rgba(46, 204, 113, ${Math.random() * 0.4 + 0.1})`,
                        life: 80,
                        growth: 0.1
                    })
                }
                onDisturb(8)
            } else if (type === 'snore') {
                particles.current.push({
                    x: sausagePos.current.x,
                    y: sausagePos.current.y,
                    type: 'text',
                    text: 'HONK-SHOO!',
                    size: 20, life: 100, vy: -1.2, vx: (Math.random() - 0.5) * 1
                })
                onDisturb(4)
            } else if (type === 'cold-feet') {
                for (let i = 0; i < 10; i++) {
                    particles.current.push({
                        x: sausagePos.current.x,
                        y: sausagePos.current.y,
                        color: '#3498db', size: 3, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 30
                    })
                }
                onDisturb(12)
            }
        }

        if (activeAttack) triggerAttack(activeAttack.type)

        let animationFrameId
        const render = () => {
            if (isGameOver) return

            // 1. Draw Environment (The Bed)
            context.fillStyle = '#2c3e50' // Dark blue sheets
            context.fillRect(0, 0, canvas.width, canvas.height)

            // Draw Blanket pattern
            context.strokeStyle = '#34495e'
            context.lineWidth = 1
            for (let i = 0; i < canvas.width; i += 40) {
                context.beginPath(); context.moveTo(i, 0); context.lineTo(i, canvas.height); context.stroke()
            }

            // 2. Draw Human (Abstractly)
            const humanX = canvas.width * 0.7
            const humanY = canvas.height * 0.5

            context.save()
            if (disturbance > 50) {
                const shake = (disturbance - 50) / 10
                context.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake)
            }

            // Draw Human (Cozy Mound)
            context.fillStyle = '#1e272e'
            context.beginPath()
            context.ellipse(humanX, humanY, 120, 280, 0.1, 0, Math.PI * 2)
            context.fill()

            // Warning Glow for Kick
            const kickCycle = frameCount.current % 300
            if (kickCycle > 240) {
                context.strokeStyle = `rgba(255, 0, 0, ${(kickCycle - 240) / 60})`
                context.lineWidth = 10
                context.beginPath()
                context.ellipse(humanX, humanY, 140, 300, 0.1, 0, Math.PI * 2)
                context.stroke()
            }
            context.restore()

            // Toss and Turn Hazard (Kicked!)
            if (kickCycle === 299) {
                const distToHuman = Math.sqrt((sausagePos.current.x - humanX) ** 2 + (sausagePos.current.y - humanY) ** 2)
                if (distToHuman < 220) {
                    onGameOver()
                    setIsGameOver(true)
                }
            }

            // 3. Update & Draw Sausage
            const moveSpeed = 4
            if (keys.current['w'] || keys.current['arrowup']) sausagePos.current.y -= moveSpeed
            if (keys.current['s'] || keys.current['arrowdown']) sausagePos.current.y += moveSpeed
            if (keys.current['a'] || keys.current['arrowleft']) {
                sausagePos.current.x -= moveSpeed
                sausageRot.current -= 0.1
            }
            if (keys.current['d'] || keys.current['arrowright']) {
                sausagePos.current.x += moveSpeed
                sausageRot.current += 0.1
            }

            // Keyboard Attack Triggers
            if (keys.current['f']) { /* Fart already handled by prop or could be direct */ }

            // Boundary
            sausagePos.current.x = Math.max(50, Math.min(canvas.width - 50, sausagePos.current.x))
            sausagePos.current.y = Math.max(50, Math.min(canvas.height - 50, sausagePos.current.y))

            // Collision with Feet area (Disturbance over time)
            const distToFeet = Math.sqrt((sausagePos.current.x - humanX) ** 2 + (sausagePos.current.y - (humanY + 200)) ** 2)
            if (distToFeet < 100) {
                onDisturb(0.15)
                if (frameCount.current % 10 === 0) {
                    particles.current.push({
                        x: sausagePos.current.x, y: sausagePos.current.y, color: '#3498db', size: 2, life: 20,
                        vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4
                    })
                }
            }

            // 4. Draw Sausage
            context.save()
            context.translate(sausagePos.current.x, sausagePos.current.y)
            context.rotate(sausageRot.current)
            context.fillStyle = '#e74c3c'
            context.beginPath()
            context.roundRect(-sausageSize.w / 2, -sausageSize.h / 2, sausageSize.w, sausageSize.h, 10)
            context.fill()

            // Eyes
            context.fillStyle = 'white'
            context.beginPath(); context.arc(20, -5, 4, 0, Math.PI * 2); context.fill()
            context.fillStyle = 'black'
            context.beginPath(); context.arc(22, -5, 2, 0, Math.PI * 2); context.fill()
            context.restore()

            // 5. Particles Update
            particles.current.forEach((p, i) => {
                p.life--
                if (p.type === 'text') {
                    p.y += p.vy
                    context.fillStyle = 'white'
                    context.font = `${p.size}px Arial`
                    context.fillText(p.text, p.x, p.y)
                } else {
                    p.x += p.vx || 0
                    p.y += p.vy || 0
                    context.fillStyle = p.color
                    context.beginPath()
                    context.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                    context.fill()
                }
            })
            particles.current = particles.current.filter(p => p.life > 0)

            // 6. Win/Loss Logic
            if (disturbance >= 100) {
                onWin()
                setIsGameOver(true)
            }

            // Random "Toss and Turn" hazard
            frameCount.current++
            if (frameCount.current % 300 === 0 && Math.random() > 0.5) {
                // Human moves! If sausage is close, it gets kicked
                context.shadowBlur = 50
                context.shadowColor = 'red'
                if (Math.abs(sausagePos.current.x - humanX) < 200) {
                    onGameOver()
                    setIsGameOver(true)
                }
            }

            animationFrameId = window.requestAnimationFrame(render)
        }

        render()

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [isGameOver, onGameOver, onWin, onDisturb, activeAttack, disturbance])

    return <canvas ref={canvasRef} style={{ display: 'block', width: '100vw', height: '100vh' }} />
}

export default GameCanvas
