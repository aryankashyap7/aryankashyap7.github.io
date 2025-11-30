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

// Parallax effect for shapes
const scaleFactor = 1 / 25
function moveBackground(event) {
    const shapes = document.querySelectorAll('.shape')
    const x = event.clientX * scaleFactor
    const y = event.clientY * scaleFactor

    for (let i = 0; i < shapes.length; i++) {
        const isOdd = i % 2 !== 0
        const boolInt = isOdd ? -1 : 1
        shapes[i].style.transform = `translate(${x * boolInt}px, ${y * boolInt}px) rotate(${x * boolInt * 0.05}deg)`
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
