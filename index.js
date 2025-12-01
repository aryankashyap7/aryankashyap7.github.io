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
    cheatMode: false,
    wave: 1,
    waveTimer: 0,
    combo: 0,
    comboTimer: 0,
    maxCombo: 0,
    gems: 0,
    
    // Player
    ship: { x: 0, y: 0, vx: 0, vy: 0, angle: 0, trail: [], baseSpeed: 280 },
    
    // Keyboard input
    keys: { up: false, down: false, left: false, right: false, shoot: false },
    
    // Objects
    asteroids: [],
    particles: [],
    stars: [],
    powerups: [],
    lasers: [],
    collectibles: [],
    planets: [],
    
    // Power-up states
    powerUpStates: {
        speedBoost: { active: false, timer: 0 },
        magnet: { active: false, timer: 0 },
        slowMo: { active: false, timer: 0 },
        multiplier: { active: false, timer: 0, value: 1 },
        bomb: { count: 0 },
        dash: { cooldown: 0, ready: true }
    },
    
    // Visual effects
    screenShake: 0,
    flashAlpha: 0,
    slowMoFactor: 1,
    nearMissTimer: 0,
    
    // Timing
    lastTime: 0,
    spawnTimer: 0,
    difficultyTimer: 0,
    powerupSpawnTimer: 0,
    gemSpawnTimer: 0
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
                // Space for shield OR restart game when game over
                if (asteroidGame.gameOver) {
                    resetAsteroidGame()
                    startAsteroidGame()
                } else if (asteroidGame.running && (asteroidGame.shields > 0 || asteroidGame.cheatMode) && !asteroidGame.shieldActive) {
                    activateShield()
                }
                e.preventDefault()
                break
            case 'x':
            case 'X':
            case 'j':
            case 'J':
                // Shoot laser
                if (asteroidGame.running) {
                    shootLaser()
                }
                e.preventDefault()
                break
            case 'Shift':
                // Dash ability
                if (asteroidGame.running && asteroidGame.powerUpStates.dash.ready) {
                    performDash()
                }
                e.preventDefault()
                break
            case 'b':
            case 'B':
                // Use bomb
                if (asteroidGame.running && asteroidGame.powerUpStates.bomb.count > 0) {
                    useBomb()
                }
                e.preventDefault()
                break
        }
        
        // Check Caps Lock state on any keydown for cheat toggle
        const capsLockOn = e.getModifierState('CapsLock')
        if (capsLockOn && !asteroidGame.cheatMode) {
            // Activate cheat mode - permanent shield
            asteroidGame.cheatMode = true
            asteroidGame.shieldActive = true
            asteroidGame.shieldTimer = 9999 // Essentially infinite
            updateShieldDisplay()
            showCheatNotification(true)
        } else if (!capsLockOn && asteroidGame.cheatMode) {
            // Deactivate cheat mode - remove shield
            asteroidGame.cheatMode = false
            asteroidGame.shieldActive = false
            asteroidGame.shieldTimer = 0
            asteroidGame.shields = 3
            updateShieldDisplay()
            showCheatNotification(false)
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

    // Mobile touch controls
    initMobileControls()

    initStars()
    updateHUD()
    requestAnimationFrame(stepAsteroidGame)
}

function showCheatNotification(activated) {
    // Remove any existing notification
    const existing = document.querySelector('.cheat-notification')
    if (existing) existing.remove()
    
    const notification = document.createElement('div')
    notification.className = 'cheat-notification'
    
    if (activated) {
        notification.classList.add('cheat-notification--activated')
        notification.innerHTML = `
            <span class="cheat-notification__icon">🔓</span>
            <span class="cheat-notification__text">CHEAT ACTIVATED: Unlimited Shields!</span>
        `
    } else {
        notification.classList.add('cheat-notification--deactivated')
        notification.innerHTML = `
            <span class="cheat-notification__icon">🔒</span>
            <span class="cheat-notification__text">CHEAT DEACTIVATED: Back to normal</span>
        `
    }
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
        notification.classList.add('visible')
    }, 10)
    
    setTimeout(() => {
        notification.classList.remove('visible')
        setTimeout(() => notification.remove(), 300)
    }, 2000)
}

function initMobileControls() {
    const controlsContainer = document.getElementById('mobileControls')
    if (!controlsContainer) return
    
    // Show controls on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        controlsContainer.classList.add('visible')
    }
    
    const dirButtons = {
        up: document.getElementById('btnUp'),
        down: document.getElementById('btnDown'),
        left: document.getElementById('btnLeft'),
        right: document.getElementById('btnRight')
    }
    
    // Directional buttons
    Object.entries(dirButtons).forEach(([key, btn]) => {
        if (!btn) return
        
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault()
            asteroidGame.keys[key] = true
            btn.classList.add('active')
            
            if (!asteroidGame.started && !asteroidGame.gameOver) {
                startAsteroidGame()
            }
        })
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault()
            asteroidGame.keys[key] = false
            btn.classList.remove('active')
        })
        
        btn.addEventListener('touchcancel', (e) => {
            e.preventDefault()
            asteroidGame.keys[key] = false
            btn.classList.remove('active')
        })
    })
    
    // Shield button
    const shieldBtn = document.getElementById('btnShield')
    if (shieldBtn) {
        shieldBtn.addEventListener('touchstart', (e) => {
            e.preventDefault()
            if (!asteroidGame.started && !asteroidGame.gameOver) {
                startAsteroidGame()
            } else if (asteroidGame.gameOver) {
                resetAsteroidGame()
                startAsteroidGame()
            } else if (asteroidGame.running && (asteroidGame.shields > 0 || asteroidGame.cheatMode) && !asteroidGame.shieldActive) {
                activateShield()
            }
        })
    }
    
    // Shoot button
    const shootBtn = document.getElementById('btnShoot')
    if (shootBtn) {
        shootBtn.addEventListener('touchstart', (e) => {
            e.preventDefault()
            if (asteroidGame.running) {
                shootLaser()
            }
        })
    }
    
    // Bomb button
    const bombBtn = document.getElementById('btnBomb')
    if (bombBtn) {
        bombBtn.addEventListener('touchstart', (e) => {
            e.preventDefault()
            if (asteroidGame.running && asteroidGame.powerUpStates.bomb.count > 0) {
                useBomb()
            }
        })
    }
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
    asteroidGame.shieldActive = asteroidGame.cheatMode
    asteroidGame.shieldTimer = asteroidGame.cheatMode ? 9999 : 0
    asteroidGame.difficulty = 1
    asteroidGame.difficultyTimer = 0
    asteroidGame.spawnTimer = 0
    asteroidGame.wave = 1
    asteroidGame.waveTimer = 0
    asteroidGame.combo = 0
    asteroidGame.comboTimer = 0
    asteroidGame.maxCombo = 0
    asteroidGame.gems = 0
    
    // Reset arrays
    asteroidGame.asteroids = []
    asteroidGame.particles = []
    asteroidGame.powerups = []
    asteroidGame.lasers = []
    asteroidGame.collectibles = []
    
    // Reset ship
    asteroidGame.ship.trail = []
    asteroidGame.ship.vx = 0
    asteroidGame.ship.vy = 0
    asteroidGame.ship.x = asteroidGame.width / 2
    asteroidGame.ship.y = asteroidGame.height / 2
    
    // Reset inputs
    asteroidGame.keys = { up: false, down: false, left: false, right: false, shoot: false }
    
    // Reset effects
    asteroidGame.screenShake = 0
    asteroidGame.flashAlpha = 0
    asteroidGame.slowMoFactor = 1
    asteroidGame.nearMissTimer = 0
    asteroidGame.gameOver = false
    
    // Reset power-up states
    asteroidGame.powerUpStates = {
        speedBoost: { active: false, timer: 0 },
        magnet: { active: false, timer: 0 },
        slowMo: { active: false, timer: 0 },
        multiplier: { active: false, timer: 0, value: 1 },
        bomb: { count: 1 },  // Start with 1 bomb
        dash: { cooldown: 0, ready: true }
    }
    
    // Reset timers
    asteroidGame.powerupSpawnTimer = 0
    asteroidGame.gemSpawnTimer = 0
    
    // Initialize background planets
    initPlanets()
    
    const overlay = document.getElementById('gameOverlay')
    if (overlay) overlay.classList.remove('visible')
    
    updateHUD()
    updateShieldDisplay()
}

function activateShield() {
    if (!asteroidGame.cheatMode) {
    asteroidGame.shields--
    }
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

// ==================== NEW GAME FEATURES ====================

// Initialize background planets
function initPlanets() {
    asteroidGame.planets = []
    const planetCount = 2 + Math.floor(Math.random() * 2)
    
    for (let i = 0; i < planetCount; i++) {
        asteroidGame.planets.push({
            x: Math.random() * asteroidGame.width,
            y: Math.random() * asteroidGame.height,
            size: 40 + Math.random() * 80,
            color: ['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#059669'][Math.floor(Math.random() * 5)],
            speed: 5 + Math.random() * 10,
            rings: Math.random() > 0.6
        })
    }
}

// Shoot laser
function shootLaser() {
    const { ship } = asteroidGame
    const speed = 500
    
    asteroidGame.lasers.push({
        x: ship.x,
        y: ship.y,
        vx: Math.cos(ship.angle) * speed,
        vy: Math.sin(ship.angle) * speed,
        life: 1.5
    })
    
    // Muzzle flash particles
    for (let i = 0; i < 5; i++) {
        asteroidGame.particles.push({
            x: ship.x + Math.cos(ship.angle) * 15,
            y: ship.y + Math.sin(ship.angle) * 15,
            vx: Math.cos(ship.angle) * 100 + (Math.random() - 0.5) * 50,
            vy: Math.sin(ship.angle) * 100 + (Math.random() - 0.5) * 50,
            life: 0.2,
            maxLife: 0.2,
            size: 3,
            color: '#fbbf24'
        })
    }
}

// Perform dash
function performDash() {
    const { ship, keys } = asteroidGame
    const dashSpeed = 400
    const dashDuration = 0.15
    
    // Determine dash direction
    let dx = 0, dy = 0
    if (keys.up) dy = -1
    if (keys.down) dy = 1
    if (keys.left) dx = -1
    if (keys.right) dx = 1
    
    // Default to ship facing direction if no keys pressed
    if (dx === 0 && dy === 0) {
        dx = Math.cos(ship.angle)
        dy = Math.sin(ship.angle)
    }
    
    const len = Math.hypot(dx, dy)
    if (len > 0) {
        dx /= len
        dy /= len
    }
    
    ship.vx = dx * dashSpeed
    ship.vy = dy * dashSpeed
    
    // Dash trail particles
    for (let i = 0; i < 15; i++) {
        asteroidGame.particles.push({
            x: ship.x,
            y: ship.y,
            vx: -dx * 100 + (Math.random() - 0.5) * 80,
            vy: -dy * 100 + (Math.random() - 0.5) * 80,
            life: 0.4,
            maxLife: 0.4,
            size: 5,
            color: '#22d3ee'
        })
    }
    
    // Set cooldown
    asteroidGame.powerUpStates.dash.ready = false
    asteroidGame.powerUpStates.dash.cooldown = 2.0
    
    // Brief invincibility during dash
    if (!asteroidGame.shieldActive) {
        asteroidGame.shieldActive = true
        asteroidGame.shieldTimer = dashDuration
    }
}

// Use bomb - clear all asteroids
function useBomb() {
    asteroidGame.powerUpStates.bomb.count--
    asteroidGame.screenShake = 15
    asteroidGame.flashAlpha = 0.8
    
    // Destroy all asteroids with explosions
    asteroidGame.asteroids.forEach(a => {
        createExplosion(a.x, a.y, a.size, 'orange')
        asteroidGame.score += 5 * asteroidGame.powerUpStates.multiplier.value
    })
    
    asteroidGame.asteroids = []
    
    // Big shockwave particles
    for (let i = 0; i < 50; i++) {
        const angle = (i / 50) * Math.PI * 2
        asteroidGame.particles.push({
            x: asteroidGame.ship.x,
            y: asteroidGame.ship.y,
            vx: Math.cos(angle) * 300,
            vy: Math.sin(angle) * 300,
            life: 1,
            maxLife: 1,
            size: 8,
            color: '#fbbf24'
        })
    }
    
    updateHUD()
}

// Spawn power-up
function spawnPowerup() {
    const types = ['speed', 'magnet', 'slowmo', 'multiplier', 'shield', 'bomb']
    const type = types[Math.floor(Math.random() * types.length)]
    
    asteroidGame.powerups.push({
        x: Math.random() * (asteroidGame.width - 60) + 30,
        y: -30,
        vy: 40 + Math.random() * 30,
        type,
        size: 20,
        rotation: 0,
        pulse: 0
    })
}

// Spawn collectible gem
function spawnGem() {
    asteroidGame.collectibles.push({
        x: Math.random() * (asteroidGame.width - 40) + 20,
        y: -20,
        vy: 50 + Math.random() * 40,
        value: Math.random() > 0.8 ? 50 : (Math.random() > 0.5 ? 20 : 10),
        size: 12,
        rotation: 0
    })
}

// Apply power-up effect
function applyPowerup(type) {
    const states = asteroidGame.powerUpStates
    const duration = 8
    
    switch(type) {
        case 'speed':
            states.speedBoost.active = true
            states.speedBoost.timer = duration
            break
        case 'magnet':
            states.magnet.active = true
            states.magnet.timer = duration
            break
        case 'slowmo':
            states.slowMo.active = true
            states.slowMo.timer = duration / 2
            asteroidGame.slowMoFactor = 0.4
            break
        case 'multiplier':
            states.multiplier.active = true
            states.multiplier.timer = duration
            states.multiplier.value = Math.random() > 0.5 ? 3 : 2
            break
        case 'shield':
            asteroidGame.shields = Math.min(asteroidGame.shields + 1, 5)
            updateShieldDisplay()
            break
        case 'bomb':
            states.bomb.count = Math.min(states.bomb.count + 1, 3)
            break
    }
    
    // Visual feedback
    asteroidGame.flashAlpha = 0.3
    showPowerupNotification(type)
    updateHUD()
}

// Show power-up notification
function showPowerupNotification(type) {
    const names = {
        speed: '⚡ SPEED BOOST',
        magnet: '🧲 MAGNET',
        slowmo: '⏱️ SLOW-MO',
        multiplier: '✖️ SCORE x' + asteroidGame.powerUpStates.multiplier.value,
        shield: '🛡️ +1 SHIELD',
        bomb: '💣 +1 BOMB'
    }
    
    const notification = document.createElement('div')
    notification.className = 'powerup-notification'
    notification.textContent = names[type] || type
    document.body.appendChild(notification)
    
    setTimeout(() => notification.classList.add('visible'), 10)
    setTimeout(() => {
        notification.classList.remove('visible')
        setTimeout(() => notification.remove(), 300)
    }, 1500)
}

// Check near-miss for combo system
function checkNearMiss(asteroid) {
    const { ship } = asteroidGame
    const dist = Math.hypot(asteroid.x - ship.x, asteroid.y - ship.y)
    const nearMissThreshold = asteroid.size + 25
    
    if (dist < nearMissThreshold && dist > asteroid.size * 0.7 + 12) {
        // Near miss!
        asteroidGame.combo++
        asteroidGame.comboTimer = 2.0
        asteroidGame.maxCombo = Math.max(asteroidGame.maxCombo, asteroidGame.combo)
        
        // Bonus points for near miss
        const bonus = 10 * asteroidGame.combo * asteroidGame.powerUpStates.multiplier.value
        asteroidGame.score += bonus
        
        // Near miss effects
        asteroidGame.nearMissTimer = 0.15
        
        // Particles
        for (let i = 0; i < 8; i++) {
            asteroidGame.particles.push({
                x: (ship.x + asteroid.x) / 2,
                y: (ship.y + asteroid.y) / 2,
                vx: (Math.random() - 0.5) * 100,
                vy: (Math.random() - 0.5) * 100,
                life: 0.5,
                maxLife: 0.5,
                size: 3,
                color: '#fbbf24'
            })
        }
        
        return true
    }
    return false
}

function spawnAsteroid(forceType = null, spawnX = null, spawnY = null, customSize = null) {
    const side = Math.floor(Math.random() * 4)
    let x, y, vx, vy
    
    const speed = 80 + asteroidGame.difficulty * 25
    const size = customSize || (15 + Math.random() * 25)
    
    // Determine asteroid type
    const typeRoll = Math.random()
    let type = 'normal'
    if (forceType) {
        type = forceType
    } else if (typeRoll < 0.08) {
        type = 'golden'      // 8% - bonus points
    } else if (typeRoll < 0.18) {
        type = 'homing'      // 10% - tracks player
    } else if (typeRoll < 0.28) {
        type = 'splitting'   // 10% - splits into smaller
    } else if (typeRoll < 0.35) {
        type = 'ice'         // 7% - leaves slow trail
    } else if (typeRoll < 0.42) {
        type = 'explosive'   // 7% - explodes on destroy
    }
    
    if (spawnX !== null && spawnY !== null) {
        // Custom spawn position (for splitting asteroids)
        x = spawnX
        y = spawnY
        const angle = Math.random() * Math.PI * 2
        vx = Math.cos(angle) * speed * 0.8
        vy = Math.sin(angle) * speed * 0.8
    } else {
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
    }
    
    // Adjust properties based on type
    let speedMult = 1
    let glowColor = null
    
    switch(type) {
        case 'golden':
            glowColor = '#fbbf24'
            break
        case 'homing':
            glowColor = '#ef4444'
            speedMult = 0.7
            break
        case 'splitting':
            glowColor = '#a855f7'
            break
        case 'ice':
            glowColor = '#38bdf8'
            speedMult = 0.8
            break
        case 'explosive':
            glowColor = '#f97316'
            break
    }
    
    vx *= speedMult
    vy *= speedMult
    
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
        type,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 3,
        vertices,
        glow: type !== 'normal',
        glowColor,
        trail: type === 'ice' ? [] : null
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
    const { ship, asteroids, particles, stars, width, height, keys, powerUpStates, lasers, powerups, collectibles, planets } = asteroidGame
    
    // Apply slow-mo effect
    const effectiveDt = dt * asteroidGame.slowMoFactor
    
    // Update score (with multiplier)
    asteroidGame.score += effectiveDt * 10 * asteroidGame.difficulty * powerUpStates.multiplier.value
    
    // Update wave timer
    asteroidGame.waveTimer += effectiveDt
    if (asteroidGame.waveTimer > 30) {
        asteroidGame.wave++
        asteroidGame.waveTimer = 0
        asteroidGame.difficulty = Math.min(asteroidGame.difficulty + 0.5, 8)
    }
    
    // Increase difficulty over time
    asteroidGame.difficultyTimer += effectiveDt
    if (asteroidGame.difficultyTimer > 8) {
        asteroidGame.difficulty = Math.min(asteroidGame.difficulty + 0.2, 8)
        asteroidGame.difficultyTimer = 0
    }
    
    // Update combo timer
    if (asteroidGame.comboTimer > 0) {
        asteroidGame.comboTimer -= dt
        if (asteroidGame.comboTimer <= 0) {
            asteroidGame.combo = 0
        }
    }
    
    // Near miss visual timer
    if (asteroidGame.nearMissTimer > 0) {
        asteroidGame.nearMissTimer -= dt
    }
    
    // Spawn asteroids
    asteroidGame.spawnTimer += effectiveDt
    const spawnRate = Math.max(0.3, 1.0 - asteroidGame.difficulty * 0.1)
    if (asteroidGame.spawnTimer > spawnRate) {
        spawnAsteroid()
        asteroidGame.spawnTimer = 0
    }
    
    // Spawn power-ups
    asteroidGame.powerupSpawnTimer += effectiveDt
    if (asteroidGame.powerupSpawnTimer > 12) {
        spawnPowerup()
        asteroidGame.powerupSpawnTimer = 0
    }
    
    // Spawn gems
    asteroidGame.gemSpawnTimer += effectiveDt
    if (asteroidGame.gemSpawnTimer > 3) {
        spawnGem()
        asteroidGame.gemSpawnTimer = 0
    }
    
    // Update power-up states
    updatePowerUpStates(dt)
    
    // Ship movement
    const acceleration = 600
    const friction = 4
    let maxSpeed = ship.baseSpeed
    if (powerUpStates.speedBoost.active) maxSpeed *= 1.5
    
    if (keys.up) ship.vy -= acceleration * effectiveDt
    if (keys.down) ship.vy += acceleration * effectiveDt
    if (keys.left) ship.vx -= acceleration * effectiveDt
    if (keys.right) ship.vx += acceleration * effectiveDt
    
    if (!keys.left && !keys.right) ship.vx *= (1 - friction * effectiveDt)
    if (!keys.up && !keys.down) ship.vy *= (1 - friction * effectiveDt)
    
    const speed = Math.hypot(ship.vx, ship.vy)
    if (speed > maxSpeed) {
        ship.vx = (ship.vx / speed) * maxSpeed
        ship.vy = (ship.vy / speed) * maxSpeed
    }
    
    ship.x += ship.vx * effectiveDt
    ship.y += ship.vy * effectiveDt
    
    const margin = 15
    ship.x = Math.max(margin, Math.min(width - margin, ship.x))
    ship.y = Math.max(margin, Math.min(height - margin, ship.y))
    
    if (ship.x <= margin || ship.x >= width - margin) ship.vx *= -0.5
    if (ship.y <= margin || ship.y >= height - margin) ship.vy *= -0.5
    
    if (Math.abs(ship.vx) > 5 || Math.abs(ship.vy) > 5) {
        ship.angle = Math.atan2(ship.vy, ship.vx)
    }
    
    ship.trail.unshift({ x: ship.x, y: ship.y, alpha: 1 })
    if (ship.trail.length > 20) ship.trail.pop()
    ship.trail.forEach(t => t.alpha -= dt * 3)
    ship.trail = ship.trail.filter(t => t.alpha > 0)
    
    // Update shield timer
    if (asteroidGame.shieldActive && !asteroidGame.cheatMode) {
        asteroidGame.shieldTimer -= dt
        if (asteroidGame.shieldTimer <= 0) {
            asteroidGame.shieldActive = false
        }
    }
    
    // Update lasers
    for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i]
        l.x += l.vx * effectiveDt
        l.y += l.vy * effectiveDt
        l.life -= effectiveDt
        
        if (l.life <= 0 || l.x < 0 || l.x > width || l.y < 0 || l.y > height) {
            lasers.splice(i, 1)
            continue
        }
        
        // Check laser-asteroid collision
        for (let j = asteroids.length - 1; j >= 0; j--) {
            const a = asteroids[j]
            const dist = Math.hypot(l.x - a.x, l.y - a.y)
            if (dist < a.size) {
                destroyAsteroid(j)
                lasers.splice(i, 1)
                break
            }
        }
    }
    
    // Update asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i]
        
        // Homing asteroids track player
        if (a.type === 'homing') {
            const dx = ship.x - a.x
            const dy = ship.y - a.y
            const dist = Math.hypot(dx, dy)
            if (dist > 0) {
                a.vx += (dx / dist) * 30 * effectiveDt
                a.vy += (dy / dist) * 30 * effectiveDt
            }
        }
        
        // Ice asteroids leave trail
        if (a.type === 'ice' && a.trail) {
            a.trail.unshift({ x: a.x, y: a.y, alpha: 0.5 })
            if (a.trail.length > 15) a.trail.pop()
            a.trail.forEach(t => t.alpha -= effectiveDt)
            a.trail = a.trail.filter(t => t.alpha > 0)
        }
        
        a.x += a.vx * effectiveDt
        a.y += a.vy * effectiveDt
        a.rotation += a.rotationSpeed * effectiveDt
        
        const offMargin = a.size * 2
        if (a.x < -offMargin || a.x > width + offMargin || 
            a.y < -offMargin || a.y > height + offMargin) {
            asteroids.splice(i, 1)
            continue
        }
        
        // Check near miss
        checkNearMiss(a)
        
        // Collision detection
        const distToShip = Math.hypot(a.x - ship.x, a.y - ship.y)
        if (distToShip < a.size * 0.7 + 12) {
            if (asteroidGame.shieldActive) {
                destroyAsteroid(i)
            } else {
                endGame()
                return
            }
        }
    }
    
    // Update power-ups
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i]
        p.y += p.vy * effectiveDt
        p.rotation += 2 * effectiveDt
        p.pulse += effectiveDt * 5
        
        if (p.y > height + 50) {
            powerups.splice(i, 1)
            continue
        }
        
        // Magnet effect
        if (powerUpStates.magnet.active) {
            const dx = ship.x - p.x
            const dy = ship.y - p.y
            const dist = Math.hypot(dx, dy)
            if (dist < 200 && dist > 0) {
                p.x += (dx / dist) * 150 * effectiveDt
                p.y += (dy / dist) * 150 * effectiveDt
            }
        }
        
        // Collect power-up
        const dist = Math.hypot(p.x - ship.x, p.y - ship.y)
        if (dist < p.size + 15) {
            applyPowerup(p.type)
            powerups.splice(i, 1)
        }
    }
    
    // Update collectibles (gems)
    for (let i = collectibles.length - 1; i >= 0; i--) {
        const g = collectibles[i]
        g.y += g.vy * effectiveDt
        g.rotation += 3 * effectiveDt
        
        if (g.y > height + 30) {
            collectibles.splice(i, 1)
            continue
        }
        
        // Magnet effect
        if (powerUpStates.magnet.active) {
            const dx = ship.x - g.x
            const dy = ship.y - g.y
            const dist = Math.hypot(dx, dy)
            if (dist < 200 && dist > 0) {
                g.x += (dx / dist) * 200 * effectiveDt
                g.y += (dy / dist) * 200 * effectiveDt
            }
        }
        
        // Collect gem
        const dist = Math.hypot(g.x - ship.x, g.y - ship.y)
        if (dist < g.size + 15) {
            asteroidGame.gems++
            asteroidGame.score += g.value * powerUpStates.multiplier.value
            collectibles.splice(i, 1)
            
            // Sparkle particles
            for (let j = 0; j < 8; j++) {
                particles.push({
                    x: g.x, y: g.y,
                    vx: (Math.random() - 0.5) * 100,
                    vy: (Math.random() - 0.5) * 100,
                    life: 0.4, maxLife: 0.4,
                    size: 3, color: '#fbbf24'
                })
            }
        }
    }
    
    // Update background planets
    if (planets) {
        planets.forEach(p => {
            p.y += p.speed * effectiveDt
            if (p.y > height + p.size) {
                p.y = -p.size
                p.x = Math.random() * width
            }
        })
    }
    
    // Update stars
    stars.forEach(s => {
        s.y += s.speed * effectiveDt
        if (s.y > height) {
            s.y = 0
            s.x = Math.random() * width
        }
    })
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx * effectiveDt
        p.y += p.vy * effectiveDt
        p.life -= dt
        p.vx *= 0.98
        p.vy *= 0.98
        if (p.life <= 0) particles.splice(i, 1)
    }
    
    // Update effects
    if (asteroidGame.screenShake > 0) asteroidGame.screenShake -= dt * 10
    if (asteroidGame.flashAlpha > 0) asteroidGame.flashAlpha -= dt * 2
    
    updateHUD()
}

function updatePowerUpStates(dt) {
    const states = asteroidGame.powerUpStates
    
    // Speed boost
    if (states.speedBoost.active) {
        states.speedBoost.timer -= dt
        if (states.speedBoost.timer <= 0) states.speedBoost.active = false
    }
    
    // Magnet
    if (states.magnet.active) {
        states.magnet.timer -= dt
        if (states.magnet.timer <= 0) states.magnet.active = false
    }
    
    // Slow-mo
    if (states.slowMo.active) {
        states.slowMo.timer -= dt
        if (states.slowMo.timer <= 0) {
            states.slowMo.active = false
            asteroidGame.slowMoFactor = 1
        }
    }
    
    // Multiplier
    if (states.multiplier.active) {
        states.multiplier.timer -= dt
        if (states.multiplier.timer <= 0) {
            states.multiplier.active = false
            states.multiplier.value = 1
        }
    }
    
    // Dash cooldown
    if (!states.dash.ready) {
        states.dash.cooldown -= dt
        if (states.dash.cooldown <= 0) {
            states.dash.ready = true
        }
    }
}

function destroyAsteroid(index) {
    const a = asteroidGame.asteroids[index]
    if (!a) return
    
    const colorMap = {
        normal: 'orange',
        golden: '#fbbf24',
        homing: '#ef4444',
        splitting: '#a855f7',
        ice: '#38bdf8',
        explosive: '#f97316'
    }
    
    createExplosion(a.x, a.y, a.size, colorMap[a.type] || 'orange')
    
    // Type-specific effects
    if (a.type === 'golden') {
        asteroidGame.score += 50 * asteroidGame.powerUpStates.multiplier.value
    }
    
    if (a.type === 'splitting' && a.size > 15) {
        for (let i = 0; i < 2; i++) {
            spawnAsteroid('normal', a.x, a.y, a.size * 0.5)
        }
    }
    
    if (a.type === 'explosive') {
        asteroidGame.screenShake = 10
        // Damage nearby asteroids
        asteroidGame.asteroids.forEach((other, idx) => {
            if (idx !== index) {
                const dist = Math.hypot(other.x - a.x, other.y - a.y)
                if (dist < 80) {
                    createExplosion(other.x, other.y, other.size * 0.5, '#f97316')
                }
            }
        })
    }
    
    asteroidGame.score += 10 * asteroidGame.powerUpStates.multiplier.value
    asteroidGame.asteroids.splice(index, 1)
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
    const waveEl = document.getElementById('gameWave')
    const bombsEl = document.getElementById('gameBombs')
    const gemsEl = document.getElementById('gameGems')
    const multiplierEl = document.getElementById('gameMultiplier')
    
    if (scoreEl) scoreEl.textContent = Math.floor(asteroidGame.score)
    if (bestEl) bestEl.textContent = asteroidGame.bestScore
    if (waveEl) waveEl.textContent = asteroidGame.wave
    if (bombsEl) bombsEl.textContent = asteroidGame.powerUpStates.bomb.count
    if (gemsEl) gemsEl.textContent = asteroidGame.gems
    
    // Show multiplier if active
    if (multiplierEl) {
        if (asteroidGame.powerUpStates.multiplier.active) {
            multiplierEl.textContent = `×${asteroidGame.powerUpStates.multiplier.value}`
            multiplierEl.classList.add('active')
        } else {
            multiplierEl.textContent = ''
            multiplierEl.classList.remove('active')
        }
    }
}

function updateShieldDisplay() {
    const shieldsContainer = document.getElementById('gameShields')
    if (!shieldsContainer) return
    
    // If cheat mode, show infinity symbol
    if (asteroidGame.cheatMode) {
        shieldsContainer.innerHTML = '<span class="game__shield game__shield--infinite">∞</span>'
        return
    }
    
    // Reset to normal shield display if needed
    if (shieldsContainer.querySelector('.game__shield--infinite')) {
        shieldsContainer.innerHTML = `
            <span class="game__shield active"></span>
            <span class="game__shield active"></span>
            <span class="game__shield active"></span>
        `
    }
    
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
    const { ctx, width, height, ship, asteroids, particles, stars, lasers, powerups, collectibles, planets } = asteroidGame
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

    // Draw background planets
    if (planets) {
        planets.forEach(p => {
            ctx.globalAlpha = 0.3
            const planetGrad = ctx.createRadialGradient(p.x - p.size * 0.3, p.y - p.size * 0.3, 0, p.x, p.y, p.size)
            planetGrad.addColorStop(0, p.color)
            planetGrad.addColorStop(1, '#0a0f1a')
            ctx.fillStyle = planetGrad
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            ctx.fill()
            
            // Rings
            if (p.rings) {
                ctx.strokeStyle = p.color
                ctx.lineWidth = 3
                ctx.beginPath()
                ctx.ellipse(p.x, p.y, p.size * 1.5, p.size * 0.3, 0.3, 0, Math.PI * 2)
                ctx.stroke()
            }
            ctx.globalAlpha = 1
        })
    }

    // Draw stars
    stars.forEach(s => {
        ctx.beginPath()
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fill()
    })

    // Draw ice asteroid trails
    asteroids.forEach(a => {
        if (a.type === 'ice' && a.trail) {
            a.trail.forEach((t, i) => {
                ctx.globalAlpha = t.alpha * 0.5
                ctx.fillStyle = '#38bdf8'
                ctx.beginPath()
                ctx.arc(t.x, t.y, 4, 0, Math.PI * 2)
                ctx.fill()
            })
            ctx.globalAlpha = 1
        }
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

    // Draw collectibles (gems)
    collectibles.forEach(g => {
        ctx.save()
        ctx.translate(g.x, g.y)
        ctx.rotate(g.rotation)
        
        // Glow
        const gemGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, g.size * 2)
        gemGlow.addColorStop(0, 'rgba(251, 191, 36, 0.4)')
        gemGlow.addColorStop(1, 'rgba(251, 191, 36, 0)')
        ctx.fillStyle = gemGlow
        ctx.beginPath()
        ctx.arc(0, 0, g.size * 2, 0, Math.PI * 2)
        ctx.fill()
        
        // Diamond shape
        const color = g.value >= 50 ? '#a855f7' : (g.value >= 20 ? '#22d3ee' : '#fbbf24')
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(0, -g.size)
        ctx.lineTo(g.size * 0.7, 0)
        ctx.lineTo(0, g.size)
        ctx.lineTo(-g.size * 0.7, 0)
        ctx.closePath()
        ctx.fill()
        
        ctx.restore()
    })

    // Draw power-ups
    powerups.forEach(p => {
        ctx.save()
        ctx.translate(p.x, p.y)
        
        // Pulsing glow
        const pulse = Math.sin(p.pulse) * 0.3 + 0.7
        const glowSize = p.size * 2 * pulse
        const colors = {
            speed: '#fbbf24',
            magnet: '#a855f7',
            slowmo: '#38bdf8',
            multiplier: '#22c55e',
            shield: '#06b6d4',
            bomb: '#ef4444'
        }
        const color = colors[p.type] || '#fff'
        
        const pwrGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize)
        pwrGlow.addColorStop(0, color + '60')
        pwrGlow.addColorStop(1, color + '00')
        ctx.fillStyle = pwrGlow
        ctx.beginPath()
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2)
        ctx.fill()
        
        // Icon background
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(0, 0, p.size, 0, Math.PI * 2)
        ctx.fill()
        
        // Icon
        ctx.fillStyle = '#000'
        ctx.font = `bold ${p.size}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const icons = { speed: '⚡', magnet: '🧲', slowmo: '⏱', multiplier: '×', shield: '🛡', bomb: '💣' }
        ctx.fillText(icons[p.type] || '?', 0, 1)
        
        ctx.restore()
    })

    // Draw lasers
    lasers.forEach(l => {
        const laserGrad = ctx.createLinearGradient(l.x - l.vx * 0.02, l.y - l.vy * 0.02, l.x, l.y)
        laserGrad.addColorStop(0, 'rgba(251, 191, 36, 0)')
        laserGrad.addColorStop(1, '#fbbf24')
        ctx.strokeStyle = laserGrad
        ctx.lineWidth = 4
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(l.x - l.vx * 0.03, l.y - l.vy * 0.03)
        ctx.lineTo(l.x, l.y)
        ctx.stroke()
        
        // Glow
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)'
        ctx.lineWidth = 8
        ctx.stroke()
    })

    // Draw ship trail
    ship.trail.forEach((t, i) => {
        const alpha = t.alpha * 0.5
        const size = 6 * (1 - i / ship.trail.length)
        ctx.beginPath()
        const gradient = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, size)
        const trailColor = asteroidGame.powerUpStates.speedBoost.active ? '251, 191, 36' : '56, 189, 248'
        gradient.addColorStop(0, `rgba(${trailColor}, ${alpha})`)
        gradient.addColorStop(1, `rgba(${trailColor}, 0)`)
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
    const glowColor = asteroidGame.powerUpStates.speedBoost.active ? 'rgba(251, 191, 36,' : 'rgba(56, 189, 248,'
    shipGlow.addColorStop(0, glowColor + '0.4)')
    shipGlow.addColorStop(1, glowColor + '0)')
    ctx.fillStyle = shipGlow
    ctx.beginPath()
    ctx.arc(0, 0, 25, 0, Math.PI * 2)
    ctx.fill()
    
    // Shield effect
    if (asteroidGame.shieldActive) {
        const shieldPulse = Math.sin(performance.now() / 50) * 0.3 + 0.7
        const shieldColor = asteroidGame.cheatMode ? 'rgba(251, 191, 36,' : 'rgba(56, 189, 248,'
        ctx.strokeStyle = shieldColor + shieldPulse + ')'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(0, 0, 22, 0, Math.PI * 2)
        ctx.stroke()
        
        ctx.strokeStyle = shieldColor + (shieldPulse * 0.5) + ')'
    ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(0, 0, 28, 0, Math.PI * 2)
        ctx.stroke()
    }

    // Ship body
    ctx.fillStyle = asteroidGame.powerUpStates.speedBoost.active ? '#fbbf24' : '#38bdf8'
        ctx.beginPath()
    ctx.moveTo(0, -14)
    ctx.lineTo(-10, 10)
    ctx.lineTo(0, 6)
    ctx.lineTo(10, 10)
        ctx.closePath()
        ctx.fill()

    // Ship highlight
    ctx.fillStyle = asteroidGame.powerUpStates.speedBoost.active ? '#fde047' : '#7dd3fc'
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
        
        // Asteroid glow based on type
        if (a.glow && a.glowColor) {
            const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, a.size * 1.5)
            glowGrad.addColorStop(0, a.glowColor + '50')
            glowGrad.addColorStop(1, a.glowColor + '00')
            ctx.fillStyle = glowGrad
            ctx.beginPath()
            ctx.arc(0, 0, a.size * 1.5, 0, Math.PI * 2)
            ctx.fill()
        }
        
        // Asteroid body color based on type
        const bodyColors = {
            normal: '#2d3748',
            golden: '#854d0e',
            homing: '#7f1d1d',
            splitting: '#581c87',
            ice: '#164e63',
            explosive: '#7c2d12'
        }
        const strokeColors = {
            normal: '#4a5568',
            golden: '#fbbf24',
            homing: '#ef4444',
            splitting: '#a855f7',
            ice: '#38bdf8',
            explosive: '#f97316'
        }
        
        ctx.fillStyle = bodyColors[a.type] || bodyColors.normal
        ctx.strokeStyle = strokeColors[a.type] || strokeColors.normal
        ctx.lineWidth = 2
        
    ctx.beginPath()
        ctx.moveTo(a.vertices[0].x, a.vertices[0].y)
        for (let i = 1; i < a.vertices.length; i++) {
            ctx.lineTo(a.vertices[i].x, a.vertices[i].y)
        }
    ctx.closePath()
    ctx.fill()
        ctx.stroke()

        // Type indicator icons
        if (a.type === 'golden') {
            ctx.fillStyle = '#fbbf24'
            ctx.font = `${a.size * 0.6}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('★', 0, 0)
        } else if (a.type === 'homing') {
            ctx.fillStyle = '#ef4444'
            ctx.font = `${a.size * 0.5}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('◎', 0, 0)
        }

    ctx.restore()
    })

    // Near miss effect
    if (asteroidGame.nearMissTimer > 0) {
        ctx.fillStyle = `rgba(251, 191, 36, ${asteroidGame.nearMissTimer * 0.3})`
        ctx.fillRect(0, 0, width, height)
    }

    // Flash effect
    if (asteroidGame.flashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${asteroidGame.flashAlpha})`
        ctx.fillRect(0, 0, width, height)
    }

    // Slow-mo vignette effect
    if (asteroidGame.slowMoFactor < 1) {
        const vignetteGrad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.7)
        vignetteGrad.addColorStop(0, 'rgba(56, 189, 248, 0)')
        vignetteGrad.addColorStop(1, 'rgba(56, 189, 248, 0.3)')
        ctx.fillStyle = vignetteGrad
        ctx.fillRect(0, 0, width, height)
    }

    // Draw combo counter
    if (asteroidGame.combo > 0) {
        ctx.save()
        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 24px JetBrains Mono, monospace'
        ctx.textAlign = 'center'
        ctx.globalAlpha = Math.min(1, asteroidGame.comboTimer)
        ctx.fillText(`${asteroidGame.combo}x COMBO!`, width / 2, 60)
        ctx.restore()
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
