import { useRef, useEffect, useState } from 'react'
import bedroomImg from '../assets/bedroom.png'
import sausageImg from '../assets/sausage.png'
import humanSleepingImg from '../assets/human_sleeping.png'
import humanDisturbedImg from '../assets/human_disturbed.png'

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
        let loadedCount = 0
        const totalImages = 4
        const handleLoad = () => {
            loadedCount++
            if (loadedCount === totalImages) setImagesLoaded(true)
        }

        assets.current.bg.src = bedroomImg
        assets.current.sausage.src = sausageImg
        assets.current.sleeping.src = humanSleepingImg
        assets.current.disturbed.src = humanDisturbedImg

        Object.values(assets.current).forEach(img => img.onload = handleLoad)

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
            if (isGameOver || !imagesLoaded) return
            if (type === 'fart') {
                for (let i = 0; i < 30; i++) {
                    particles.current.push({
                        x: sausagePos.current.x,
                        y: sausagePos.current.y,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        size: Math.random() * 30 + 10,
                        color: `rgba(168, 213, 186, ${Math.random() * 0.4 + 0.12})`, // Soft watercolor green
                        life: 120,
                        growth: 0.15
                    })
                }
                onDisturb(8)
            } else if (type === 'snore') {
                particles.current.push({
                    x: sausagePos.current.x,
                    y: sausagePos.current.y,
                    type: 'text',
                    text: 'HONK-SHOO!',
                    size: 26, life: 140, vy: -1.4, vx: (Math.random() - 0.5) * 1.5
                })
                onDisturb(4)
            } else if (type === 'cold-feet') {
                for (let i = 0; i < 15; i++) {
                    particles.current.push({
                        x: sausagePos.current.x,
                        y: sausagePos.current.y,
                        color: 'rgba(135, 206, 235, 0.6)',
                        size: 4, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 40
                    })
                }
                onDisturb(12)
            }
        }

        if (activeAttack) triggerAttack(activeAttack.type)

        let animationFrameId
        const render = () => {
            if (isGameOver || !imagesLoaded) {
                animationFrameId = window.requestAnimationFrame(render)
                return
            }

            // 1. Draw Background (Studio Ghibli Bedroom)
            const bg = assets.current.bg
            const scale = Math.max(canvas.width / bg.width, canvas.height / bg.height)
            const x = (canvas.width / 2) - (bg.width / 2) * scale
            const y = (canvas.height / 2) - (bg.height / 2) * scale
            context.drawImage(bg, x, y, bg.width * scale, bg.height * scale)

            // 2. Human Partner
            const humanX = canvas.width * 0.7
            const humanY = canvas.height * 0.5
            const humanImg = disturbance > 80 ? assets.current.disturbed : assets.current.sleeping
            const humanScale = 0.8

            context.save()
            if (disturbance > 50) {
                const shake = (disturbance - 50) / 8
                context.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake)
            }

            context.drawImage(
                humanImg,
                humanX - (humanImg.width * humanScale / 2),
                humanY - (humanImg.height * humanScale / 2),
                humanImg.width * humanScale,
                humanImg.height * humanScale
            )

            // Warning Glow for Kick
            const kickCycle = frameCount.current % 300
            if (kickCycle > 240) {
                context.strokeStyle = `rgba(255, 100, 100, ${(kickCycle - 240) / 60})`
                context.lineWidth = 15
                context.setLineDash([20, 10])
                context.beginPath()
                context.ellipse(humanX, humanY, 200, 200, 0, 0, Math.PI * 2)
                context.stroke()
            }
            context.restore()

            // Toss and Turn Hazard (Kicked!)
            if (kickCycle === 299) {
                const distToHuman = Math.sqrt((sausagePos.current.x - humanX) ** 2 + (sausagePos.current.y - humanY) ** 2)
                if (distToHuman < 250) {
                    onGameOver()
                    setIsGameOver(true)
                }
            }

            // 3. Update & Draw Sausage
            const moveSpeed = 6
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

            // 4. Draw Sausage Sprite
            const sImg = assets.current.sausage
            const sScale = 0.3
            context.save()
            context.translate(sausagePos.current.x, sausagePos.current.y)
            context.rotate(sausageRot.current)
            context.drawImage(
                sImg,
                -(sImg.width * sScale / 2),
                -(sImg.height * sScale / 2),
                sImg.width * sScale,
                sImg.height * sScale
            )
            context.restore()

            // 5. Particles Update
            particles.current.forEach((p) => {
                p.life--
                p.x += p.vx || 0
                p.y += p.vy || 0
                if (p.growth) p.size += p.growth
                if (p.type === 'text') {
                    context.fillStyle = `rgba(255, 255, 255, ${p.life / 140})`
                    context.font = `bold ${p.size}px "Indie Flower", cursive`
                    context.fillText(p.text, p.x, p.y)
                } else {
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

            frameCount.current++
            animationFrameId = window.requestAnimationFrame(render)
        }

        render()

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [isGameOver, onGameOver, onWin, onDisturb, activeAttack, disturbance, imagesLoaded])

    return (
        <>
            {!imagesLoaded && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: '#fdf6e3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100, fontFamily: '"Indie Flower", cursive', fontSize: '2rem', color: '#657b83'
                }}>
                    Entering the dream... 🌸
                </div>
            )}
            <canvas ref={canvasRef} style={{ display: 'block', width: '100vw', height: '100vh', cursor: 'pointer' }} />
        </>
    )
}

export default GameCanvas
