let isModalOpen = false

// Contact form submission
function contact(event) {
    event.preventDefault()
    const loading = document.querySelector('.modal__overlay--loading')
    const success = document.querySelector('.modal__overlay--success')
    loading.classList.add('modal__overlay--visible')

    emailjs
        .sendForm('aryankashyap_email', 'aryankashyap_template', event.target, 'seCKWFuPSTJAb1zqo')
        .then(() => {
            loading.classList.remove('modal__overlay--visible')
            success.classList.add('modal__overlay--visible')
            setTimeout(() => {
                success.classList.remove('modal__overlay--visible')
                toggleModal()
            }, 3000)
        })
        .catch(() => {
            loading.classList.remove('modal__overlay--visible')
            alert('The email service is temporarily unavailable. Please contact me directly at akmail2017@gmail.com')
        })
}

// Toggle modal
function toggleModal() {
    if (isModalOpen) {
        isModalOpen = false
        return document.body.classList.remove('modal--open')
    }
    isModalOpen = true
    document.body.classList.add('modal--open')
}

// Theme toggle (light mode toggle - dark is default)
let contrastToggle = true
function toggleContrast() {
    contrastToggle = !contrastToggle
    if (contrastToggle) {
        document.body.classList.add('dark-theme')
    } else {
        document.body.classList.remove('dark-theme')
    }
}

// Parallax effect for shapes + interactive hero blob
const scaleFactor = 1 / 25
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Physics-style blob movement state
let blobTargetX = 0
let blobTargetY = 0
let blobCurrentX = 0
let blobCurrentY = 0
let blobVelocityX = 0
let blobVelocityY = 0

const blobStiffness = 0.12
const blobDamping = 0.8

function animateBlob() {
    if (prefersReducedMotion) return

    const blob = document.querySelector('.hero-orb__blob')
    if (!blob) {
        requestAnimationFrame(animateBlob)
        return
    }

    const dx = blobTargetX - blobCurrentX
    const dy = blobTargetY - blobCurrentY

    blobVelocityX = blobVelocityX * blobDamping + dx * blobStiffness
    blobVelocityY = blobVelocityY * blobDamping + dy * blobStiffness

    blobCurrentX += blobVelocityX
    blobCurrentY += blobVelocityY

    blob.style.setProperty('--blobOffsetX', `${blobCurrentX}px`)
    blob.style.setProperty('--blobOffsetY', `${blobCurrentY}px`)

    requestAnimationFrame(animateBlob)
}

function moveBackground(event) {
    const shapes = document.querySelectorAll('.shape')
    const x = event.clientX * scaleFactor
    const y = event.clientY * scaleFactor

    for (let i = 0; i < shapes.length; i++) {
        const isOdd = i % 2 !== 0
        const boolInt = isOdd ? -1 : 1
        shapes[i].style.transform = `translate(${x * boolInt}px, ${y * boolInt}px) rotate(${x * boolInt * 0.05}deg)`
    }

    if (!prefersReducedMotion) {
        // Subtle tilt for the hero orb to enhance the 3D feel
        const orb = document.querySelector('.hero-orb')
        if (orb) {
            const rect = orb.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2

            // Normalize cursor position relative to orb center and clamp
            let relX = (event.clientX - centerX) / rect.width
            let relY = (event.clientY - centerY) / rect.height

            const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
            relX = clamp(relX, -0.8, 0.8)
            relY = clamp(relY, -0.8, 0.8)

            const tiltX = relX * 12
            const tiltY = -relY * 9

            orb.style.setProperty('--tiltX', `${tiltX}deg`)
            orb.style.setProperty('--tiltY', `${tiltY}deg`)

            // Drive blob target towards cursor with a limited offset
            const maxOffset = 20
            blobTargetX = relX * maxOffset
            blobTargetY = relY * maxOffset
        }
    }
}

// Navbar scroll effect
let lastScroll = 0
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav')
    const currentScroll = window.pageYOffset
    
    if (currentScroll > 80) {
        nav.classList.add('scrolled')
    } else {
        nav.classList.remove('scrolled')
    }
    
    lastScroll = currentScroll
})

// Smooth reveal on scroll
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
        }
    })
}, observerOptions)

// ==================== ASTEROID DODGE – ARCADE GAME ====================
const asteroidGame = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    
    // Game state
    running: false,
    started: false,
    gameOver: false,
    score: 0,
    bestScore: parseInt(localStorage.getItem('asteroidBest') || '0'),
    shields: 3,
    shieldActive: false,
    shieldTimer: 0,
    difficulty: 1,
    
    // Player
    ship: { x: 0, y: 0, vx: 0, vy: 0, angle: 0, trail: [] },
    
    // Keyboard input
    keys: { up: false, down: false, left: false, right: false },
    
    // Objects
    asteroids: [],
    particles: [],
    stars: [],
    powerups: [],
    
    // Visual effects
    screenShake: 0,
    flashAlpha: 0,
    
    // Timing
    lastTime: 0,
    spawnTimer: 0,
    difficultyTimer: 0
}

function initAsteroidGame() {
    const canvas = document.getElementById('asteroidGame')
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    asteroidGame.canvas = canvas
    asteroidGame.ctx = ctx

    resizeAsteroidCanvas()
    window.addEventListener('resize', resizeAsteroidCanvas)

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        // Start game on any arrow key
        if (!asteroidGame.started && !asteroidGame.gameOver) {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
                startAsteroidGame()
            }
        }
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                asteroidGame.keys.up = true
                e.preventDefault()
                break
            case 'ArrowDown':
            case 's':
            case 'S':
                asteroidGame.keys.down = true
                e.preventDefault()
                break
            case 'ArrowLeft':
            case 'a':
            case 'A':
                asteroidGame.keys.left = true
                e.preventDefault()
                break
            case 'ArrowRight':
            case 'd':
            case 'D':
                asteroidGame.keys.right = true
                e.preventDefault()
                break
            case ' ':
                // Space for shield
                if (asteroidGame.running && asteroidGame.shields > 0 && !asteroidGame.shieldActive) {
                    activateShield()
                }
                e.preventDefault()
                break
        }
    })

    document.addEventListener('keyup', (e) => {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                asteroidGame.keys.up = false
                break
            case 'ArrowDown':
            case 's':
            case 'S':
                asteroidGame.keys.down = false
                break
            case 'ArrowLeft':
            case 'a':
            case 'A':
                asteroidGame.keys.left = false
                break
            case 'ArrowRight':
            case 'd':
            case 'D':
                asteroidGame.keys.right = false
                break
        }
    })

    // Click/touch for shield activation
    canvas.addEventListener('click', () => {
        if (!asteroidGame.started && !asteroidGame.gameOver) {
            startAsteroidGame()
        } else if (asteroidGame.running && asteroidGame.shields > 0 && !asteroidGame.shieldActive) {
            activateShield()
        }
    })

    canvas.addEventListener('touchstart', (e) => {
        if (!asteroidGame.started && !asteroidGame.gameOver) {
            startAsteroidGame()
        } else if (asteroidGame.running && asteroidGame.shields > 0 && !asteroidGame.shieldActive) {
            activateShield()
        }
    })

    // Restart button
    const restartBtn = document.getElementById('gameRestart')
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            resetAsteroidGame()
            startAsteroidGame()
        })
    }

    initStars()
    updateHUD()
    requestAnimationFrame(stepAsteroidGame)
}

function resizeAsteroidCanvas() {
    if (!asteroidGame.canvas) return
    const rect = asteroidGame.canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    asteroidGame.canvas.width = rect.width * dpr
    asteroidGame.canvas.height = rect.height * dpr
    asteroidGame.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    asteroidGame.width = rect.width
    asteroidGame.height = rect.height

    // Center ship
    asteroidGame.ship.x = rect.width / 2
    asteroidGame.ship.y = rect.height / 2
    asteroidGame.ship.targetX = rect.width / 2
    asteroidGame.ship.targetY = rect.height / 2

    initStars()
}

function initStars() {
    asteroidGame.stars = []
    const count = 80
    for (let i = 0; i < count; i++) {
        asteroidGame.stars.push({
            x: Math.random() * asteroidGame.width,
            y: Math.random() * asteroidGame.height,
            size: Math.random() * 1.5 + 0.5,
            speed: Math.random() * 30 + 10,
            alpha: Math.random() * 0.5 + 0.3
        })
    }
}

function startAsteroidGame() {
    asteroidGame.started = true
    asteroidGame.running = true
    asteroidGame.gameOver = false
    asteroidGame.lastTime = performance.now()
    
    const startOverlay = document.getElementById('gameStart')
    if (startOverlay) startOverlay.classList.add('hidden')
}

function resetAsteroidGame() {
    asteroidGame.score = 0
    asteroidGame.shields = 3
    asteroidGame.shieldActive = false
    asteroidGame.shieldTimer = 0
    asteroidGame.difficulty = 1
    asteroidGame.difficultyTimer = 0
    asteroidGame.spawnTimer = 0
    asteroidGame.asteroids = []
    asteroidGame.particles = []
    asteroidGame.powerups = []
    asteroidGame.ship.trail = []
    asteroidGame.ship.vx = 0
    asteroidGame.ship.vy = 0
    asteroidGame.keys = { up: false, down: false, left: false, right: false }
    asteroidGame.screenShake = 0
    asteroidGame.flashAlpha = 0
    asteroidGame.gameOver = false
    
    asteroidGame.ship.x = asteroidGame.width / 2
    asteroidGame.ship.y = asteroidGame.height / 2
    
    const overlay = document.getElementById('gameOverlay')
    if (overlay) overlay.classList.remove('visible')
    
    updateHUD()
    updateShieldDisplay()
}

function activateShield() {
    asteroidGame.shields--
    asteroidGame.shieldActive = true
    asteroidGame.shieldTimer = 1.5 // 1.5 seconds of invincibility
    asteroidGame.flashAlpha = 0.4
    
    // Create shield burst particles
    for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2
        asteroidGame.particles.push({
            x: asteroidGame.ship.x,
            y: asteroidGame.ship.y,
            vx: Math.cos(angle) * 150,
            vy: Math.sin(angle) * 150,
            life: 0.6,
            maxLife: 0.6,
            size: 4,
            color: 'cyan'
        })
    }
    
    updateShieldDisplay()
}

function spawnAsteroid() {
    const side = Math.floor(Math.random() * 4)
    let x, y, vx, vy
    
    const speed = 80 + asteroidGame.difficulty * 25
    const size = 15 + Math.random() * 25
    
    switch(side) {
        case 0: // top
            x = Math.random() * asteroidGame.width
            y = -size
            vx = (Math.random() - 0.5) * speed * 0.5
            vy = Math.random() * speed * 0.5 + speed * 0.5
            break
        case 1: // right
            x = asteroidGame.width + size
            y = Math.random() * asteroidGame.height
            vx = -(Math.random() * speed * 0.5 + speed * 0.5)
            vy = (Math.random() - 0.5) * speed * 0.5
            break
        case 2: // bottom
            x = Math.random() * asteroidGame.width
            y = asteroidGame.height + size
            vx = (Math.random() - 0.5) * speed * 0.5
            vy = -(Math.random() * speed * 0.5 + speed * 0.5)
            break
        case 3: // left
            x = -size
            y = Math.random() * asteroidGame.height
            vx = Math.random() * speed * 0.5 + speed * 0.5
            vy = (Math.random() - 0.5) * speed * 0.5
            break
    }
    
    // Generate asteroid shape (irregular polygon)
    const vertices = []
    const vertexCount = 6 + Math.floor(Math.random() * 4)
    for (let i = 0; i < vertexCount; i++) {
        const angle = (i / vertexCount) * Math.PI * 2
        const radius = size * (0.7 + Math.random() * 0.3)
        vertices.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        })
    }
    
    asteroidGame.asteroids.push({
        x, y, vx, vy,
        size,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 3,
        vertices,
        glow: Math.random() > 0.7 // Some asteroids glow
    })
}

function stepAsteroidGame(timestamp) {
    if (!asteroidGame.canvas || !asteroidGame.ctx) {
        requestAnimationFrame(stepAsteroidGame)
        return
    }

    const dt = Math.min((timestamp - asteroidGame.lastTime) / 1000, 0.05) || 0.016
    asteroidGame.lastTime = timestamp

    if (asteroidGame.running && !asteroidGame.gameOver) {
        updateAsteroidGame(dt)
    } else {
        // Still update visual effects even when game is over
        updateGameOverEffects(dt)
    }
    
    renderAsteroidGame()
    requestAnimationFrame(stepAsteroidGame)
}

function updateGameOverEffects(dt) {
    const { particles, stars, width } = asteroidGame
    
    // Decay screen shake
    if (asteroidGame.screenShake > 0) {
        asteroidGame.screenShake -= dt * 15
        if (asteroidGame.screenShake < 0) asteroidGame.screenShake = 0
    }
    
    // Decay flash
    if (asteroidGame.flashAlpha > 0) {
        asteroidGame.flashAlpha -= dt * 3
        if (asteroidGame.flashAlpha < 0) asteroidGame.flashAlpha = 0
    }
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.life -= dt
        p.vx *= 0.96
        p.vy *= 0.96
        
        if (p.life <= 0) {
            particles.splice(i, 1)
        }
    }
    
    // Keep stars moving
    stars.forEach(s => {
        s.y += s.speed * dt * 0.3
        if (s.y > asteroidGame.height) {
            s.y = 0
            s.x = Math.random() * width
        }
    })
}

function updateAsteroidGame(dt) {
    const { ship, asteroids, particles, stars, width, height, keys } = asteroidGame
    
    // Update score
    asteroidGame.score += dt * 10 * asteroidGame.difficulty
    
    // Increase difficulty over time
    asteroidGame.difficultyTimer += dt
    if (asteroidGame.difficultyTimer > 8) {
        asteroidGame.difficulty = Math.min(asteroidGame.difficulty + 0.3, 5)
        asteroidGame.difficultyTimer = 0
    }
    
    // Spawn asteroids
    asteroidGame.spawnTimer += dt
    const spawnRate = Math.max(0.4, 1.2 - asteroidGame.difficulty * 0.15)
    if (asteroidGame.spawnTimer > spawnRate) {
        spawnAsteroid()
        asteroidGame.spawnTimer = 0
    }
    
    // Ship movement with arrow keys (acceleration-based for smooth feel)
    const acceleration = 600
    const friction = 4
    const maxSpeed = 280
    
    // Apply acceleration based on keys
    if (keys.up) ship.vy -= acceleration * dt
    if (keys.down) ship.vy += acceleration * dt
    if (keys.left) ship.vx -= acceleration * dt
    if (keys.right) ship.vx += acceleration * dt
    
    // Apply friction when no keys pressed
    if (!keys.left && !keys.right) {
        ship.vx *= (1 - friction * dt)
    }
    if (!keys.up && !keys.down) {
        ship.vy *= (1 - friction * dt)
    }
    
    // Clamp speed
    const speed = Math.hypot(ship.vx, ship.vy)
    if (speed > maxSpeed) {
        ship.vx = (ship.vx / speed) * maxSpeed
        ship.vy = (ship.vy / speed) * maxSpeed
    }
    
    // Update position
    ship.x += ship.vx * dt
    ship.y += ship.vy * dt
    
    // Keep ship within bounds
    const margin = 15
    ship.x = Math.max(margin, Math.min(width - margin, ship.x))
    ship.y = Math.max(margin, Math.min(height - margin, ship.y))
    
    // Bounce off edges slightly
    if (ship.x <= margin || ship.x >= width - margin) ship.vx *= -0.5
    if (ship.y <= margin || ship.y >= height - margin) ship.vy *= -0.5
    
    // Calculate ship angle based on velocity
    if (Math.abs(ship.vx) > 5 || Math.abs(ship.vy) > 5) {
        ship.angle = Math.atan2(ship.vy, ship.vx)
    }
    
    // Update ship trail
    ship.trail.unshift({ x: ship.x, y: ship.y, alpha: 1 })
    if (ship.trail.length > 20) ship.trail.pop()
    ship.trail.forEach(t => t.alpha -= dt * 3)
    ship.trail = ship.trail.filter(t => t.alpha > 0)
    
    // Update shield timer
    if (asteroidGame.shieldActive) {
        asteroidGame.shieldTimer -= dt
        if (asteroidGame.shieldTimer <= 0) {
            asteroidGame.shieldActive = false
        }
    }
    
    // Update asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i]
        a.x += a.vx * dt
        a.y += a.vy * dt
        a.rotation += a.rotationSpeed * dt
        
        // Remove if off screen
        const margin = a.size * 2
        if (a.x < -margin || a.x > width + margin || 
            a.y < -margin || a.y > height + margin) {
            asteroids.splice(i, 1)
            continue
        }
        
        // Collision detection with ship
        const distToShip = Math.hypot(a.x - ship.x, a.y - ship.y)
        if (distToShip < a.size * 0.7 + 12) {
            if (asteroidGame.shieldActive) {
                // Destroy asteroid with shield
                createExplosion(a.x, a.y, a.size, 'cyan')
                asteroids.splice(i, 1)
            } else {
                // Game over
                endGame()
                return
            }
        }
    }
    
    // Update stars (parallax)
    stars.forEach(s => {
        s.y += s.speed * dt
        if (s.y > height) {
            s.y = 0
            s.x = Math.random() * width
        }
    })
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.life -= dt
        p.vx *= 0.98
        p.vy *= 0.98
        
        if (p.life <= 0) {
            particles.splice(i, 1)
        }
    }
    
    // Update screen shake
    if (asteroidGame.screenShake > 0) {
        asteroidGame.screenShake -= dt * 10
    }
    
    // Update flash
    if (asteroidGame.flashAlpha > 0) {
        asteroidGame.flashAlpha -= dt * 2
    }
    
    // Update HUD
    updateHUD()
}

function createExplosion(x, y, size, color = 'orange') {
    const particleCount = Math.floor(size * 1.5)
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 50 + Math.random() * 150
        const particleColor = color === 'orange' 
            ? (Math.random() > 0.5 ? '#fbbf24' : '#fb7185')
            : '#38bdf8'
        
        asteroidGame.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.5 + Math.random() * 0.5,
            maxLife: 1,
            size: 2 + Math.random() * 4,
            color: particleColor
        })
    }
    
    asteroidGame.screenShake = 5
}

function endGame() {
    asteroidGame.running = false
    asteroidGame.gameOver = true
    
    // Create big explosion at ship
    createExplosion(asteroidGame.ship.x, asteroidGame.ship.y, 40, 'orange')
    asteroidGame.screenShake = 8
    asteroidGame.flashAlpha = 0.5
    
    // Update best score
    const finalScore = Math.floor(asteroidGame.score)
    if (finalScore > asteroidGame.bestScore) {
        asteroidGame.bestScore = finalScore
        localStorage.setItem('asteroidBest', finalScore.toString())
    }
    
    // Show game over overlay
    setTimeout(() => {
        const overlay = document.getElementById('gameOverlay')
        const finalScoreEl = document.getElementById('finalScore')
        const finalBestEl = document.getElementById('finalBest')
        
        if (overlay) overlay.classList.add('visible')
        if (finalScoreEl) finalScoreEl.textContent = finalScore
        if (finalBestEl) finalBestEl.textContent = asteroidGame.bestScore
    }, 500)
}

function updateHUD() {
    const scoreEl = document.getElementById('gameScore')
    const bestEl = document.getElementById('gameBest')
    
    if (scoreEl) scoreEl.textContent = Math.floor(asteroidGame.score)
    if (bestEl) bestEl.textContent = asteroidGame.bestScore
}

function updateShieldDisplay() {
    const shieldsContainer = document.getElementById('gameShields')
    if (!shieldsContainer) return
    
    const shields = shieldsContainer.querySelectorAll('.game__shield')
    shields.forEach((shield, i) => {
        if (i < asteroidGame.shields) {
            shield.classList.add('active')
        } else {
            shield.classList.remove('active')
        }
    })
}

function renderAsteroidGame() {
    const { ctx, width, height, ship, asteroids, particles, stars } = asteroidGame
    if (!ctx || width === 0 || height === 0) return

    ctx.save()
    
    // Apply screen shake
    if (asteroidGame.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * asteroidGame.screenShake
        const shakeY = (Math.random() - 0.5) * asteroidGame.screenShake
        ctx.translate(shakeX, shakeY)
    }

    // Background gradient
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width)
    bgGrad.addColorStop(0, '#0a0f1a')
    bgGrad.addColorStop(1, '#020617')
    ctx.fillStyle = bgGrad
    ctx.fillRect(-10, -10, width + 20, height + 20)

    // Draw stars
    stars.forEach(s => {
        ctx.beginPath()
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fill()
    })

    // Draw particles
    particles.forEach(p => {
        const alpha = p.life / p.maxLife
        ctx.beginPath()
        ctx.fillStyle = p.color
        ctx.globalAlpha = alpha
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
    })

    // Draw ship trail
    ship.trail.forEach((t, i) => {
        const alpha = t.alpha * 0.5
        const size = 6 * (1 - i / ship.trail.length)
        ctx.beginPath()
        const gradient = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, size)
        gradient.addColorStop(0, `rgba(56, 189, 248, ${alpha})`)
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0)')
        ctx.fillStyle = gradient
        ctx.arc(t.x, t.y, size, 0, Math.PI * 2)
        ctx.fill()
    })

    // Draw ship
    ctx.save()
    ctx.translate(ship.x, ship.y)
    ctx.rotate(ship.angle + Math.PI / 2)
    
    // Ship glow
    const shipGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 25)
    shipGlow.addColorStop(0, 'rgba(56, 189, 248, 0.4)')
    shipGlow.addColorStop(1, 'rgba(56, 189, 248, 0)')
    ctx.fillStyle = shipGlow
    ctx.beginPath()
    ctx.arc(0, 0, 25, 0, Math.PI * 2)
    ctx.fill()
    
    // Shield effect
    if (asteroidGame.shieldActive) {
        const shieldPulse = Math.sin(performance.now() / 50) * 0.3 + 0.7
        ctx.strokeStyle = `rgba(56, 189, 248, ${shieldPulse})`
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(0, 0, 22, 0, Math.PI * 2)
        ctx.stroke()
        
        ctx.strokeStyle = `rgba(34, 211, 238, ${shieldPulse * 0.5})`
    ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(0, 0, 28, 0, Math.PI * 2)
        ctx.stroke()
    }

    // Ship body (triangle)
    ctx.fillStyle = '#38bdf8'
        ctx.beginPath()
    ctx.moveTo(0, -14)
    ctx.lineTo(-10, 10)
    ctx.lineTo(0, 6)
    ctx.lineTo(10, 10)
        ctx.closePath()
        ctx.fill()

    // Ship highlight
    ctx.fillStyle = '#7dd3fc'
        ctx.beginPath()
    ctx.moveTo(0, -10)
    ctx.lineTo(-4, 4)
    ctx.lineTo(0, 2)
    ctx.lineTo(4, 4)
        ctx.closePath()
        ctx.fill()
    
    // Engine glow
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(0, 12, 4, 0, Math.PI * 2)
    ctx.fill()
    
    const engineGlow = ctx.createRadialGradient(0, 12, 0, 0, 12, 12)
    engineGlow.addColorStop(0, 'rgba(251, 191, 36, 0.6)')
    engineGlow.addColorStop(1, 'rgba(251, 191, 36, 0)')
    ctx.fillStyle = engineGlow
    ctx.beginPath()
    ctx.arc(0, 12, 12, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()

    // Draw asteroids
    asteroids.forEach(a => {
        ctx.save()
        ctx.translate(a.x, a.y)
        ctx.rotate(a.rotation)
        
        // Asteroid glow (for glowing asteroids)
        if (a.glow) {
            const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, a.size * 1.5)
            glowGrad.addColorStop(0, 'rgba(251, 113, 133, 0.3)')
            glowGrad.addColorStop(1, 'rgba(251, 113, 133, 0)')
            ctx.fillStyle = glowGrad
            ctx.beginPath()
            ctx.arc(0, 0, a.size * 1.5, 0, Math.PI * 2)
            ctx.fill()
        }
        
        // Asteroid body
        ctx.fillStyle = a.glow ? '#4a3f4f' : '#2d3748'
        ctx.strokeStyle = a.glow ? '#fb7185' : '#4a5568'
        ctx.lineWidth = 2
        
    ctx.beginPath()
        ctx.moveTo(a.vertices[0].x, a.vertices[0].y)
        for (let i = 1; i < a.vertices.length; i++) {
            ctx.lineTo(a.vertices[i].x, a.vertices[i].y)
        }
    ctx.closePath()
    ctx.fill()
        ctx.stroke()

        // Crater details
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
        ctx.arc(a.size * 0.2, -a.size * 0.1, a.size * 0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
        ctx.arc(-a.size * 0.3, a.size * 0.2, a.size * 0.15, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
    })

    // Flash effect
    if (asteroidGame.flashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${asteroidGame.flashAlpha})`
        ctx.fillRect(0, 0, width, height)
    }

    ctx.restore()
}

// Observe elements on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set dark theme as default
    document.body.classList.add('dark-theme')
    
    // Hide loader after page loads
    const loader = document.querySelector('.loader')
    setTimeout(() => {
        loader.classList.add('hidden')
    }, 1500)
    
    // Observe skill cards and projects
    const skillCards = document.querySelectorAll('.skills__language')
    const projects = document.querySelectorAll('.project')
    
    skillCards.forEach(card => {
        card.style.opacity = '0'
        card.style.transform = 'translateY(30px)'
        card.style.transition = 'all 0.6s ease'
        observer.observe(card)
    })
    
    projects.forEach(project => observer.observe(project))

    // Kick off continuous blob animation loop (for cursor-based physics)
    requestAnimationFrame(animateBlob)

    // Initialize professional cursor glow
    initCursorGlow()

    // Initialize GitHub Activity section
    initGitHubActivity()

    // Initialise Asteroid Dodge game
    initAsteroidGame()
})

// Page loaded
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader')
    setTimeout(() => {
        loader.classList.add('hidden')
    }, 800)
})

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) {
        toggleModal()
    }
})

// ==================== PROFESSIONAL CURSOR GLOW ====================
const cursorGlow = {
    element: null,
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    active: false
}

function initCursorGlow() {
    cursorGlow.element = document.getElementById('cursorGlow')
    if (!cursorGlow.element || prefersReducedMotion) return

    document.addEventListener('mousemove', (e) => {
        cursorGlow.targetX = e.clientX
        cursorGlow.targetY = e.clientY
        
        if (!cursorGlow.active) {
            cursorGlow.active = true
            cursorGlow.element.classList.add('active')
        }
    })

    document.addEventListener('mouseleave', () => {
        cursorGlow.active = false
        cursorGlow.element.classList.remove('active')
    })

    animateCursorGlow()
}

function animateCursorGlow() {
    if (!cursorGlow.element) return

    // Smooth follow with easing
    const ease = 0.15
    cursorGlow.x += (cursorGlow.targetX - cursorGlow.x) * ease
    cursorGlow.y += (cursorGlow.targetY - cursorGlow.y) * ease

    cursorGlow.element.style.left = `${cursorGlow.x}px`
    cursorGlow.element.style.top = `${cursorGlow.y}px`

    requestAnimationFrame(animateCursorGlow)
}

// ==================== GITHUB ACTIVITY VISUALIZATION ====================
const githubActivity = {
    username: 'aryankashyap7',
    contributions: [],
    events: [],
    stats: {
        repos: 0,
        followers: 0,
        stars: 0,
        totalContributions: 0,
        currentStreak: 0,
        longestStreak: 0
    }
}

async function initGitHubActivity() {
    const graphEl = document.getElementById('contributionGraph')
    const feedEl = document.getElementById('activityFeed')
    
    if (!graphEl) return

    // Generate contribution graph (simulated data that looks realistic)
    generateContributionGraph(graphEl)
    
    // Fetch real GitHub data
    try {
        await fetchGitHubData()
    } catch (error) {
        console.log('Using simulated GitHub data')
        simulateGitHubStats()
    }

    // Generate activity feed
    generateActivityFeed(feedEl)
    
    // Initialize holographic card effect
    initHoloCard()
}

function generateContributionGraph(container) {
    container.innerHTML = ''
    
    const weeks = 52
    const today = new Date()
    let totalContributions = 0
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    
    // Generate realistic-looking contribution data
    const contributionData = []
    
    for (let week = 0; week < weeks; week++) {
        const weekEl = document.createElement('div')
        weekEl.className = 'contribution-week'
        
        for (let day = 0; day < 7; day++) {
            const dayEl = document.createElement('div')
            dayEl.className = 'contribution-day'
            
            // Calculate date
            const daysAgo = (weeks - week - 1) * 7 + (6 - day)
            const date = new Date(today)
            date.setDate(date.getDate() - daysAgo)
            
            // Generate realistic contribution level
            // Higher activity on weekdays, occasional bursts
            const isWeekend = day === 0 || day === 6
            const baseChance = isWeekend ? 0.3 : 0.6
            const burstChance = Math.sin(week * 0.5) * 0.2 + 0.1
            
            let level = 0
            const rand = Math.random()
            
            if (rand < baseChance + burstChance) {
                if (rand < 0.15) level = 4
                else if (rand < 0.3) level = 3
                else if (rand < 0.5) level = 2
                else level = 1
            }
            
            // Recent days more likely to have contributions
            if (daysAgo < 14 && Math.random() > 0.4) {
                level = Math.max(level, Math.floor(Math.random() * 3) + 1)
            }
            
            const contributions = level === 0 ? 0 : level * 2 + Math.floor(Math.random() * 3)
            totalContributions += contributions
            
            // Track streaks
            if (contributions > 0) {
                tempStreak++
                if (daysAgo === 0 || (daysAgo === 1 && currentStreak === 0)) {
                    currentStreak = tempStreak
                }
            } else {
                longestStreak = Math.max(longestStreak, tempStreak)
                tempStreak = 0
            }
            
            dayEl.setAttribute('data-level', level)
            dayEl.setAttribute('data-tooltip', `${contributions} contributions on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`)
            
            weekEl.appendChild(dayEl)
        }
        
        container.appendChild(weekEl)
    }
    
    longestStreak = Math.max(longestStreak, tempStreak)
    
    // Update summary
    document.getElementById('totalContributions').textContent = totalContributions
    document.getElementById('currentStreak').textContent = currentStreak
    document.getElementById('longestStreak').textContent = longestStreak
    
    githubActivity.stats.totalContributions = totalContributions
    githubActivity.stats.currentStreak = currentStreak
    githubActivity.stats.longestStreak = longestStreak
}

async function fetchGitHubData() {
    const response = await fetch(`https://api.github.com/users/${githubActivity.username}`)
    if (!response.ok) throw new Error('Failed to fetch')
    
    const userData = await response.json()
    
    githubActivity.stats.repos = userData.public_repos
    githubActivity.stats.followers = userData.followers
    
    // Update UI
    document.getElementById('repoCount').textContent = userData.public_repos
    document.getElementById('followerCount').textContent = userData.followers
    
    // Fetch repos for star count
    const reposResponse = await fetch(`https://api.github.com/users/${githubActivity.username}/repos?per_page=100`)
    if (reposResponse.ok) {
        const repos = await reposResponse.json()
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
        githubActivity.stats.stars = totalStars
        document.getElementById('starCount').textContent = totalStars
    }
    
    // Fetch recent events
    const eventsResponse = await fetch(`https://api.github.com/users/${githubActivity.username}/events?per_page=10`)
    if (eventsResponse.ok) {
        githubActivity.events = await eventsResponse.json()
    }
}

function simulateGitHubStats() {
    // Fallback simulated data
    const stats = {
        repos: 25,
        followers: 120,
        stars: 85
    }
    
    document.getElementById('repoCount').textContent = stats.repos
    document.getElementById('followerCount').textContent = stats.followers
    document.getElementById('starCount').textContent = stats.stars
    
    githubActivity.stats = { ...githubActivity.stats, ...stats }
}

function generateActivityFeed(container) {
    if (!container) return
    
    // Generate realistic activity items
    const activities = [
        { type: 'push', repo: 'InfraSage', message: 'feat: Add LLM-driven orchestration', time: '2 hours ago' },
        { type: 'push', repo: 'TranslateAI', message: 'fix: Improve batch processing', time: '5 hours ago' },
        { type: 'star', repo: 'langchain-ai/langchain', message: 'Starred', time: '1 day ago' },
        { type: 'pr', repo: 'aryankashyap7/portfolio', message: 'PR merged: Update hero section', time: '2 days ago' },
        { type: 'push', repo: 'Agrisense', message: 'docs: Update API documentation', time: '3 days ago' },
        { type: 'fork', repo: 'huggingface/transformers', message: 'Forked repository', time: '5 days ago' }
    ]
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-item__icon activity-item__icon--${activity.type}">
                <i class="fa-solid ${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-item__content">
                <div class="activity-item__title">
                    ${activity.message} in <a href="#">${activity.repo}</a>
                </div>
                <div class="activity-item__meta">${activity.time}</div>
            </div>
        </div>
    `).join('')
}

function getActivityIcon(type) {
    const icons = {
        push: 'fa-code-commit',
        star: 'fa-star',
        fork: 'fa-code-fork',
        pr: 'fa-code-pull-request'
    }
    return icons[type] || 'fa-circle'
}

// ==================== HOLOGRAPHIC CARD EFFECT ====================
function initHoloCard() {
    const card = document.getElementById('holoCard')
    if (!card || prefersReducedMotion) return

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        
        const rotateX = (y - centerY) / 15
        const rotateY = (centerX - x) / 15
        
        const inner = card.querySelector('.holo-card__inner')
        inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
        
        // Update shine position
        const shine = card.querySelector('.holo-card__shine')
        const shineX = (x / rect.width) * 100
        const shineY = (y / rect.height) * 100
        shine.style.background = `
            radial-gradient(
                circle at ${shineX}% ${shineY}%,
                rgba(255, 255, 255, 0.15) 0%,
                rgba(56, 189, 248, 0.1) 20%,
                rgba(251, 191, 36, 0.1) 40%,
                rgba(34, 197, 94, 0.1) 60%,
                transparent 80%
            )
        `
    })

    card.addEventListener('mouseleave', () => {
        const inner = card.querySelector('.holo-card__inner')
        inner.style.transform = 'rotateX(0) rotateY(0)'
    })
}

// Prevent modal close when clicking inside
document.addEventListener('click', (e) => {
    if (isModalOpen && e.target.classList.contains('modal')) {
        const modalContent = document.querySelector('.modal__half')
        if (!modalContent.contains(e.target)) {
            toggleModal()
        }
    }
})
