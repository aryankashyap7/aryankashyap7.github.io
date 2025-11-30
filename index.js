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

// ==================== NIGHT FLIGHT – CANVAS MINI GAME ====================
const flightGame = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    terrain: [],
    planeY: 0,
    planeVy: 0,
    targetY: 0,
    scrollX: 0,
    speed: 160,
    boost: 0,
    gravity: 280,
    damping: 0.9,
    running: false,
    crashed: false,
    distance: 0,
    lastTime: 0
}

function initFlightGame() {
    const canvas = document.getElementById('flightGame')
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    flightGame.canvas = canvas
    flightGame.ctx = ctx

    resizeFlightCanvas()
    window.addEventListener('resize', resizeFlightCanvas)

    canvas.addEventListener('mousemove', handleFlightMouseMove)
    canvas.addEventListener('mouseleave', () => {
        flightGame.targetY = flightGame.height * 0.5
    })

    canvas.addEventListener('mousedown', () => {
        if (flightGame.crashed) {
            resetFlightGame()
        } else {
            flightGame.boost = 1.1
        }
    })

    resetFlightGame()
    requestAnimationFrame(stepFlightGame)
}

function resizeFlightCanvas() {
    if (!flightGame.canvas) return
    const rect = flightGame.canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    flightGame.canvas.width = rect.width * dpr
    flightGame.canvas.height = rect.height * dpr
    flightGame.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    flightGame.width = rect.width
    flightGame.height = rect.height

    if (flightGame.terrain.length === 0) {
        generateTerrain()
    }
}

function generateTerrain() {
    flightGame.terrain = []
    const segments = 120
    const width = flightGame.width
    const height = flightGame.height
    const baseGap = height * 0.45
    let midpoint = height * 0.5

    for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const noise = (Math.sin(t * Math.PI * 2) + Math.sin(t * Math.PI * 4 + 1.2)) * 0.12
        midpoint += (Math.random() - 0.5) * height * 0.08
        midpoint = Math.max(height * 0.3, Math.min(height * 0.7, midpoint))
        const gap = baseGap * (0.8 + Math.random() * 0.4)
        const top = midpoint - gap / 2 + noise * height
        const bottom = midpoint + gap / 2 + noise * height
        flightGame.terrain.push({
            x: (i / segments) * (width * 2),
            top,
            bottom
        })
    }
}

function handleFlightMouseMove(e) {
    const rect = flightGame.canvas.getBoundingClientRect()
    const y = e.clientY - rect.top
    flightGame.targetY = y
}

function resetFlightGame() {
    const h = flightGame.height || 240
    flightGame.planeY = h * 0.5
    flightGame.targetY = h * 0.5
    flightGame.planeVy = 0
    flightGame.scrollX = 0
    flightGame.distance = 0
    flightGame.speed = 180
    flightGame.boost = 0
    flightGame.running = true
    flightGame.crashed = false
    flightGame.lastTime = performance.now()
    generateTerrain()
    updateFlightHud()
}

function stepFlightGame(timestamp) {
    if (!flightGame.canvas || !flightGame.ctx) return

    const dt = (timestamp - flightGame.lastTime) / 1000 || 0.016
    flightGame.lastTime = timestamp

    updateFlightState(dt)
    renderFlightScene()

    requestAnimationFrame(stepFlightGame)
}

function updateFlightState(dt) {
    if (!flightGame.running) return

    if (flightGame.boost > 0) {
        flightGame.speed += 180 * dt
        flightGame.boost -= dt
    } else {
        flightGame.speed += (180 - flightGame.speed) * 0.6 * dt
    }

    const accel = (flightGame.targetY - flightGame.planeY) * 4
    flightGame.planeVy += accel * dt
    flightGame.planeVy *= flightGame.damping
    flightGame.planeY += flightGame.planeVy * dt

    const width = flightGame.width
    const height = flightGame.height

    flightGame.scrollX += flightGame.speed * dt
    flightGame.distance += flightGame.speed * dt * 0.2

    // Keep world coordinates bounded to avoid precision / disappearing terrain
    if (flightGame.scrollX > width) {
        flightGame.scrollX -= width
        const shift = width
        flightGame.terrain.forEach(p => {
            p.x -= shift
        })
    }

    const planeX = width * 0.28
    const planeY = flightGame.planeY

    const terrain = flightGame.terrain
    if (terrain.length > 1) {
        // find segment range near plane
        const tunnelX = flightGame.scrollX + planeX
        for (let i = 0; i < terrain.length - 1; i++) {
            const a = terrain[i]
            const b = terrain[i + 1]
            if (tunnelX >= a.x && tunnelX <= b.x) {
                const t = (tunnelX - a.x) / (b.x - a.x)
                const top = a.top + (b.top - a.top) * t
                const bottom = a.bottom + (b.bottom - a.bottom) * t
                const margin = 12
                if (planeY - margin < top || planeY + margin > bottom) {
                    flightGame.running = false
                    flightGame.crashed = true
                    updateFlightHud(true)
                }
                break
            }
        }
    }

    // recycle terrain ahead when scroll passes first segment
    const first = terrain[0]
    if (flightGame.scrollX > first.x + width) {
        terrain.shift()
        const prev = terrain[terrain.length - 1]
        const x = prev.x + width / 8
        const baseGap = height * 0.42
        const midpoint = (prev.top + prev.bottom) / 2 + (Math.random() - 0.5) * height * 0.08
        const gap = baseGap * (0.9 + Math.random() * 0.25)
        const top = Math.max(height * 0.18, Math.min(height * 0.75, midpoint - gap / 2))
        const bottom = Math.max(top + gap * 0.7, midpoint + gap / 2)
        terrain.push({ x, top, bottom })
    }

    updateFlightHud()
}

function renderFlightScene() {
    const ctx = flightGame.ctx
    const width = flightGame.width
    const height = flightGame.height
    if (!ctx || width === 0 || height === 0) return

    ctx.clearRect(0, 0, width, height)

    const skyGrad = ctx.createLinearGradient(0, 0, 0, height)
    skyGrad.addColorStop(0, '#020617')
    skyGrad.addColorStop(1, '#020617')
    ctx.fillStyle = skyGrad
    ctx.fillRect(0, 0, width, height)

    ctx.save()
    ctx.translate(-flightGame.scrollX, 0)

    ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)'
    ctx.lineWidth = 1
    for (let x = 0; x < width * 3; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x - 10, height)
        ctx.stroke()
    }

    const terrainGrad = ctx.createLinearGradient(0, 0, 0, height)
    terrainGrad.addColorStop(0, 'rgba(15, 23, 42, 1)')
    terrainGrad.addColorStop(1, '#020617')

    const terrain = flightGame.terrain
    if (terrain.length > 1) {
        // top
        ctx.fillStyle = terrainGrad
        ctx.beginPath()
        ctx.moveTo(terrain[0].x, 0)
        terrain.forEach(p => {
            ctx.lineTo(p.x, p.top)
        })
        ctx.lineTo(terrain[terrain.length - 1].x, 0)
        ctx.closePath()
        ctx.fill()

        // bottom
        ctx.beginPath()
        ctx.moveTo(terrain[0].x, height)
        terrain.forEach(p => {
            ctx.lineTo(p.x, p.bottom)
        })
        ctx.lineTo(terrain[terrain.length - 1].x, height)
        ctx.closePath()
        ctx.fill()
    }

    ctx.restore()

    const planeX = width * 0.28
    const planeY = flightGame.planeY

    ctx.save()
    ctx.translate(planeX, planeY)
    const bank = (flightGame.planeVy / 220)
    ctx.rotate(bank * 0.4)

    const bodyGrad = ctx.createLinearGradient(-22, 0, 28, 0)
    bodyGrad.addColorStop(0, '#0f172a')
    bodyGrad.addColorStop(0.4, '#38bdf8')
    bodyGrad.addColorStop(1, '#fbbf24')

    ctx.fillStyle = bodyGrad
    ctx.beginPath()
    ctx.moveTo(-22, 0)
    ctx.quadraticCurveTo(-4, -10, 20, 0)
    ctx.quadraticCurveTo(-4, 10, -22, 0)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = 'rgba(15,23,42,0.9)'
    ctx.beginPath()
    ctx.ellipse(-6, -4, 7, 4, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#38bdf8'
    ctx.beginPath()
    ctx.moveTo(-10, 3)
    ctx.lineTo(-2, 16)
    ctx.lineTo(6, 3)
    ctx.closePath()
    ctx.fill()

    ctx.restore()

    ctx.save()
    ctx.globalAlpha = 0.32
    ctx.fillStyle = '#020617'
    ctx.beginPath()
    ctx.ellipse(planeX, planeY + 16, 34, 10, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    if (flightGame.crashed) {
        ctx.fillStyle = 'rgba(15,23,42,0.78)'
        ctx.fillRect(0, 0, width, height)
        ctx.fillStyle = '#fee2e2'
        ctx.font = '700 1.2rem "Sora", system-ui, -apple-system, BlinkMacSystemFont'
        ctx.textAlign = 'center'
        ctx.fillText('Crashed into the canyon', width / 2, height / 2 - 10)
        ctx.font = '400 0.85rem "Sora", system-ui, -apple-system, BlinkMacSystemFont'
        ctx.fillStyle = '#9ca3af'
        ctx.fillText('Click to try again', width / 2, height / 2 + 16)
    }
}

function updateFlightHud(crashed) {
    const distanceEl = document.getElementById('flightDistance')
    const statusEl = document.getElementById('flightStatus')
    if (distanceEl) {
        distanceEl.textContent = `${Math.floor(flightGame.distance)} m`
    }
    if (statusEl) {
        if (crashed || flightGame.crashed) {
            statusEl.textContent = 'Crashed'
        } else if (flightGame.speed > 220) {
            statusEl.textContent = 'Fast'
        } else {
            statusEl.textContent = 'Cruising'
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

    // Initialise Night Flight mini-game
    initFlightGame()
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
