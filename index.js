let isModalOpen = false

function contact(event) {
    event.preventDefault()
    const loading = document.querySelector('.modal__overlay--loading')
    const success = document.querySelector('.modal__overlay--success')
    console.log(event.target)
    loading.classList += ' modal__overlay--visible'

    emailjs
        .sendForm('aryankashyap_email', 'aryankashyap_template', event.target, 'seCKWFuPSTJAb1zqo')
        .then(() => {
            loading.classList.remove('modal__overlay--visible')
            success.classList += ' modal__overlay--visible'
        })
        .catch(() => {
            loading.classList.remove('modal__overlay--visible')
            alert('The email service is temporarily unavilable, please contact me directly on akmail2017@gmail.com')
        })
}

function toggleModal() {
    if (isModalOpen) {
        isModalOpen = false
        return document.body.classList.remove('modal--open')
    }
    isModalOpen = true
    document.body.classList += ' modal--open'
}

let contrastToggle = false
function toggleContrast() {
    contrastToggle = !contrastToggle
    if (contrastToggle == true) {
        document.body.classList += ' dark-theme'
    } else {
        document.body.classList.remove('dark-theme')
    }
}

const scaleFactor = 1 / 20
function moveBackground() {
    const shapes = document.querySelectorAll('.shape')
    const x = event.clientX * scaleFactor
    const y = event.clientY * scaleFactor

    for (let i = 0; i < shapes.length; i++) {
        const isOdd = i % 2 !== 0
        const boolInt = isOdd ? -1 : 1

        shapes[i].style.transform = `translate(${x * boolInt}px, ${y * boolInt}px)`
    }
}
