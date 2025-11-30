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

// ==================== STARLINE – SPACE LANE SHOOTER ====================
const shooterGame = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    playerX: 0,
    playerY: 0,
    playerSpeed: 280,
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false,
    bullets: [],
    enemies: [],
    enemyBullets: [],
    lastTime: 0,
    fireCooldown: 0,
    running: false,
    crashed: false,
    score: 0,
    shields: 3
}

function initShooterGame() {
    const canvas = document.getElementById('shooterGame')
    if (!canvas) return
    shooterGame.canvas = canvas
    shooterGame.ctx = canvas.getContext('2d')

    resizeShooterCanvas()
    window.addEventListener('resize', resizeShooterCanvas)

    document.addEventListener('keydown', handleShooterKeydown)
    document.addEventListener('keyup', handleShooterKeyup)

    resetShooterGame()
    requestAnimationFrame(stepShooterGame)
}

function resizeShooterCanvas() {
    if (!shooterGame.canvas) return
    const rect = shooterGame.canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    shooterGame.canvas.width = rect.width * dpr
    shooterGame.canvas.height = rect.height * dpr
    shooterGame.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    shooterGame.width = rect.width
    shooterGame.height = rect.height

    if (!shooterGame.running && !shooterGame.crashed) {
        shooterGame.playerX = shooterGame.width / 2
        shooterGame.playerY = shooterGame.height * 0.78
    }
}

function resetShooterGame() {
    shooterGame.bullets = []
    shooterGame.enemies = []
    shooterGame.enemyBullets = []
    shooterGame.playerX = shooterGame.width / 2
    shooterGame.playerY = shooterGame.height * 0.78
    shooterGame.score = 0
    shooterGame.shields = 3
    shooterGame.running = true
    shooterGame.crashed = false
    shooterGame.lastTime = performance.now()
    shooterGame.fireCooldown = 0

    spawnEnemyWave()
    updateShooterHud()
}

function handleShooterKeydown(e) {
    if (e.key === 'ArrowLeft') {
        shooterGame.moveLeft = true
    } else if (e.key === 'ArrowRight') {
        shooterGame.moveRight = true
    } else if (e.key === 'ArrowUp') {
        shooterGame.moveUp = true
    } else if (e.key === 'ArrowDown') {
        shooterGame.moveDown = true
    } else if (e.key === ' ' && shooterGame.running) {
        e.preventDefault()
        tryFireBullet()
    } else if ((e.key === 'Enter' || e.key === ' ') && shooterGame.crashed) {
        e.preventDefault()
        resetShooterGame()
    }
}

function handleShooterKeyup(e) {
    if (e.key === 'ArrowLeft') shooterGame.moveLeft = false
    if (e.key === 'ArrowRight') shooterGame.moveRight = false
    if (e.key === 'ArrowUp') shooterGame.moveUp = false
    if (e.key === 'ArrowDown') shooterGame.moveDown = false
}

function spawnEnemyWave() {
    const cols = 6
    const spacingX = shooterGame.width / (cols + 1)
    const y = shooterGame.height * 0.12
    shooterGame.enemies = []
    for (let i = 0; i < cols; i++) {
        shooterGame.enemies.push({
            x: spacingX * (i + 1),
            y,
            vx: (Math.random() - 0.5) * 40,
            phase: Math.random() * Math.PI * 2,
            alive: true,
            coolDown: Math.random() * 1.2 + 0.5
        })
    }
}

function tryFireBullet() {
    if (shooterGame.fireCooldown > 0) return
    shooterGame.bullets.push({
        x: shooterGame.playerX,
        y: shooterGame.playerY - 18,
        vy: -420
    })
    shooterGame.fireCooldown = 0.16
}

function stepShooterGame(timestamp) {
    if (!shooterGame.canvas || !shooterGame.ctx) return

    const dt = (timestamp - shooterGame.lastTime) / 1000 || 0.016
    shooterGame.lastTime = timestamp

    updateShooterState(dt)
    renderShooterScene()

    requestAnimationFrame(stepShooterGame)
}

function updateShooterState(dt) {
    if (!shooterGame.running) return

    const speed = shooterGame.playerSpeed
    let dx = 0
    let dy = 0
    if (shooterGame.moveLeft) dx -= 1
    if (shooterGame.moveRight) dx += 1
    if (shooterGame.moveUp) dy -= 1
    if (shooterGame.moveDown) dy += 1
    if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy) || 1
        dx /= len
        dy /= len
    }
    shooterGame.playerX += dx * speed * dt
    shooterGame.playerY += dy * speed * dt

    const margin = 14
    shooterGame.playerX = Math.max(margin, Math.min(shooterGame.width - margin, shooterGame.playerX))
    shooterGame.playerY = Math.max(shooterGame.height * 0.45, Math.min(shooterGame.height - margin, shooterGame.playerY))

    if (shooterGame.fireCooldown > 0) shooterGame.fireCooldown -= dt

    shooterGame.bullets.forEach(b => {
        b.y += b.vy * dt
    })
    shooterGame.bullets = shooterGame.bullets.filter(b => b.y > -20)

    shooterGame.enemies.forEach(e => {
        if (!e.alive) return
        e.phase += dt * 1.4
        e.y = shooterGame.height * 0.12 + Math.sin(e.phase) * 12
        e.x += e.vx * dt
        if (e.x < 40 || e.x > shooterGame.width - 40) e.vx *= -1

        e.coolDown -= dt
        if (e.coolDown <= 0) {
            shooterGame.enemyBullets.push({
                x: e.x,
                y: e.y + 12,
                vy: 220 + Math.random() * 80
            })
            e.coolDown = Math.random() * 1.6 + 0.6
        }
    })

    shooterGame.enemyBullets.forEach(b => {
        b.y += b.vy * dt
    })
    shooterGame.enemyBullets = shooterGame.enemyBullets.filter(b => b.y < shooterGame.height + 20)

    shooterGame.bullets.forEach(b => {
        shooterGame.enemies.forEach(e => {
            if (!e.alive) return
            const dx = b.x - e.x
            const dy = b.y - e.y
            if (Math.abs(dx) < 26 && Math.abs(dy) < 20) {
                e.alive = false
                b.y = -9999
                shooterGame.score += 10
            }
        })
    })
    shooterGame.bullets = shooterGame.bullets.filter(b => b.y > -900)

    const stillAlive = shooterGame.enemies.some(e => e.alive)
    if (!stillAlive) {
        spawnEnemyWave()
    }

    shooterGame.enemyBullets.forEach(b => {
        const dx = b.x - shooterGame.playerX
        const dy = b.y - shooterGame.playerY
        if (Math.abs(dx) < 16 && Math.abs(dy) < 18 && shooterGame.running) {
            b.y = shooterGame.height + 999
            applyPlayerHit()
        }
    })
    shooterGame.enemyBullets = shooterGame.enemyBullets.filter(b => b.y < shooterGame.height + 500)

    shooterGame.enemies.forEach(e => {
        if (!e.alive) return
        const dx = e.x - shooterGame.playerX
        const dy = e.y - shooterGame.playerY
        if (Math.abs(dx) < 24 && Math.abs(dy) < 20 && shooterGame.running) {
            e.alive = false
            applyPlayerHit()
        }
    })

    updateShooterHud()
}

function applyPlayerHit() {
    shooterGame.shields -= 1
    if (shooterGame.shields <= 0) {
        shooterGame.running = false
        shooterGame.crashed = true
    } else {
        shooterGame.playerX = shooterGame.width / 2
        shooterGame.playerY = shooterGame.height * 0.8
        shooterGame.enemyBullets = []
    }
}

function renderShooterScene() {
    const ctx = shooterGame.ctx
    const w = shooterGame.width
    const h = shooterGame.height
    if (!ctx || !w || !h) return

    ctx.clearRect(0, 0, w, h)

    const bgGrad = ctx.createLinearGradient(0, 0, 0, h)
    bgGrad.addColorStop(0, '#020617')
    bgGrad.addColorStop(0.6, '#020617')
    bgGrad.addColorStop(1, '#020617')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, w, h)

    ctx.save()
    ctx.strokeStyle = 'rgba(15,23,42,0.9)'
    ctx.lineWidth = 1
    for (let i = 0; i < 16; i++) {
        const y = (i / 16) * h
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y + 18)
        ctx.stroke()
    }
    ctx.restore()

    // Enemies – angular drones
    shooterGame.enemies.forEach(e => {
        if (!e.alive) return
        const rx = e.x
        const ry = e.y
        ctx.save()
        ctx.translate(rx, ry)

        const shellGrad = ctx.createLinearGradient(-18, -14, 18, 14)
        shellGrad.addColorStop(0, '#f97316')
        shellGrad.addColorStop(0.4, '#fb7185')
        shellGrad.addColorStop(1, '#facc15')
        ctx.fillStyle = shellGrad

        ctx.beginPath()
        ctx.moveTo(0, -16)
        ctx.lineTo(18, 0)
        ctx.lineTo(8, 14)
        ctx.lineTo(-8, 14)
        ctx.lineTo(-18, 0)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = 'rgba(15,23,42,0.85)'
        ctx.beginPath()
        ctx.ellipse(0, -2, 6, 4, 0, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
    })

    ctx.save()
    ctx.fillStyle = '#38bdf8'
    shooterGame.bullets.forEach(b => {
        ctx.beginPath()
        ctx.roundRect(b.x - 2, b.y - 10, 4, 18, 2)
        ctx.fill()
    })
    ctx.restore()

    ctx.save()
    ctx.fillStyle = '#fb7185'
    shooterGame.enemyBullets.forEach(b => {
        ctx.beginPath()
        ctx.roundRect(b.x - 2, b.y - 6, 4, 12, 2)
        ctx.fill()
    })
    ctx.restore()

    // Player ship – more readable top‑down spacecraft
    const px = shooterGame.playerX
    const py = shooterGame.playerY
    ctx.save()
    ctx.translate(px, py)

    const shipGrad = ctx.createLinearGradient(0, -22, 0, 20)
    shipGrad.addColorStop(0, '#e5f2ff')
    shipGrad.addColorStop(0.35, '#38bdf8')
    shipGrad.addColorStop(0.7, '#0ea5e9')
    shipGrad.addColorStop(1, '#0f172a')
    ctx.fillStyle = shipGrad

    // Central fuselage
    ctx.beginPath()
    ctx.moveTo(0, -22)        // nose
    ctx.lineTo(10, -4)        // right shoulder
    ctx.lineTo(8, 10)
    ctx.lineTo(0, 20)         // tail
    ctx.lineTo(-8, 10)
    ctx.lineTo(-10, -4)       // left shoulder
    ctx.closePath()
    ctx.fill()

    // Side wings
    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.moveTo(-6, 2)
    ctx.lineTo(-18, 6)
    ctx.lineTo(-12, 14)
    ctx.lineTo(-4, 10)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(6, 2)
    ctx.lineTo(18, 6)
    ctx.lineTo(12, 14)
    ctx.lineTo(4, 10)
    ctx.closePath()
    ctx.fill()

    // Cockpit
    ctx.fillStyle = 'rgba(15,23,42,0.95)'
    ctx.beginPath()
    ctx.ellipse(0, -6, 6, 5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Engine glow at the tail
    const engineGrad = ctx.createRadialGradient(0, 20, 2, 0, 24, 10)
    engineGrad.addColorStop(0, '#38bdf8')
    engineGrad.addColorStop(1, 'rgba(56,189,248,0)')
    ctx.fillStyle = engineGrad
    ctx.beginPath()
    ctx.ellipse(0, 24, 10, 6, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()

    ctx.save()
    ctx.globalAlpha = 0.26
    ctx.fillStyle = '#38bdf8'
    ctx.beginPath()
    ctx.ellipse(px, py + 18, 22, 9, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    if (shooterGame.crashed) {
        ctx.fillStyle = 'rgba(15,23,42,0.86)'
        ctx.fillRect(0, 0, w, h)
        ctx.fillStyle = '#fee2e2'
        ctx.font = '700 1.1rem "Sora", system-ui, -apple-system, BlinkMacSystemFont'
        ctx.textAlign = 'center'
        ctx.fillText('Hull breach – run over', w / 2, h / 2 - 8)
        ctx.font = '400 0.85rem "Sora", system-ui, -apple-system, BlinkMacSystemFont'
        ctx.fillStyle = '#9ca3af'
        ctx.fillText('Press Enter to launch again', w / 2, h / 2 + 16)
    }
}

function updateShooterHud() {
    const scoreEl = document.getElementById('shooterScore')
    const statusEl = document.getElementById('shooterStatus')
    if (scoreEl) scoreEl.textContent = shooterGame.score.toString()
    if (statusEl) {
        if (shooterGame.crashed) {
            statusEl.textContent = 'Destroyed'
        } else if (shooterGame.shields <= 1) {
            statusEl.textContent = 'Critical'
        } else if (shooterGame.score > 80) {
            statusEl.textContent = 'Onslaught'
        } else if (shooterGame.score > 40) {
            statusEl.textContent = 'Engaged'
        } else {
            statusEl.textContent = 'Ready'
        }
    }
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

    // Initialise Starline space shooter
    initShooterGame()
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

// Enhanced cursor trail effect (optional - premium touch)
let cursorTrail = []
const trailLength = 20

document.addEventListener('mousemove', (e) => {
    cursorTrail.push({ x: e.clientX, y: e.clientY })
    if (cursorTrail.length > trailLength) {
        cursorTrail.shift()
    }
})

// Prevent modal close when clicking inside
document.addEventListener('click', (e) => {
    if (isModalOpen && e.target.classList.contains('modal')) {
        const modalContent = document.querySelector('.modal__half')
        if (!modalContent.contains(e.target)) {
            toggleModal()
        }
    }
})
