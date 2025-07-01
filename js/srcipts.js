// =======================
// MENU
// =======================
const menuToggle = document.getElementById('menuToggle')
const mobileMenu = document.getElementById('mobileMenu')
const menuClose = document.getElementById('menuClose')
const overlay = document.getElementById('overlay')
const mobileLinks = mobileMenu.querySelectorAll('a')
const sections = document.querySelectorAll('section')
const menuLinks = document.querySelectorAll('.desktop-menu a')

// Menu toggle
menuToggle.addEventListener('click', () => {
	mobileMenu.classList.add('active')
	overlay.style.display = 'block'
})

// Menu close
menuClose.addEventListener('click', closeMenu)
overlay.addEventListener('click', closeMenu)

mobileLinks.forEach(link => link.addEventListener('click', closeMenu))

function closeMenu() {
	mobileMenu.classList.remove('active')
	overlay.style.display = 'none'
}

// Active link on scroll
window.addEventListener('scroll', () => {
	let current = ''

	sections.forEach(section => {
		const sectionTop = section.offsetTop
		const sectionHeight = section.clientHeight

		if (pageYOffset >= sectionTop - sectionHeight / 3) {
			current = section.getAttribute('id')
		}
	})

	menuLinks.forEach(link => {
		link.classList.remove('active')
		if (link.getAttribute('href') === '#' + current) {
			link.classList.add('active')
		}
	})
})

//Scroll window

menuLinks.forEach(link => {
	link.addEventListener('click', event => {
		event.preventDefault()

		const targetId = link.getAttribute('href').substring(1)
		const targetSection = document.getElementById(targetId)

		closeMenu()

		// Czekamy aż menu się schowa
		setTimeout(() => {
			if (targetSection) {
				targetSection.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				})
			}
		}, 300) // Dopasuj do czasu animacji menu
	})
})

// =======================
// SERDUSZKA W SWIPERZE
// =======================
const favorites = new Set()

document.querySelector('.featured-swiper').addEventListener('click', event => {
	const heartButton = event.target.closest('.heart-icon')
	if (!heartButton) return

	const productId = heartButton.getAttribute('data-product-id')

	if (favorites.has(productId)) {
		favorites.delete(productId)
	} else {
		favorites.add(productId)
	}

	updateHearts()
})

function updateHearts() {
	document.querySelectorAll('.heart-icon').forEach(button => {
		const productId = button.getAttribute('data-product-id')
		if (favorites.has(productId)) {
			button.querySelector('.heart-default').classList.add('hidden')
			button.querySelector('.heart-filled').classList.remove('hidden')
		} else {
			button.querySelector('.heart-default').classList.remove('hidden')
			button.querySelector('.heart-filled').classList.add('hidden')
		}
	})
}

document.addEventListener('DOMContentLoaded', () => {
	const swiper = new Swiper('.featured-swiper', {
		loop: true,
		slidesPerView: 4,
		spaceBetween: 24,
		pagination: { el: '.swiper-pagination', type: 'progressbar', clickable: true },
		navigation: { nextEl: '.swiper-button-next' },
		breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 4 } },
	})

	swiper.on('slideChange', () => updateHearts())
	updateHearts()
})

// =======================
// SEKCJA PRODUKTÓW
// =======================
const productContainer = document.getElementById('productContainer')
const dropdownToggle = document.getElementById('dropdownToggle')
const dropdownMenu = document.getElementById('dropdownMenu')

let pageSize = 14
let currentPage = 1
let productCount = 0
const apiUrl = 'https://brandstestowy.smallhost.pl/api/random?pageNumber='

let loading = false
let bannerInserted = false

const bannerHTML = `
    <div class="banner-container">
        <img src="img/banner.webp" alt="Narciarz zjeżdżający po stoku wśród rozpryskującego się śniegu z górskim krajobrazem w tle" loading="lazy" class="banner-image">
        <div class="banner-content">
            <div>
                <span class="banner-label">FORMASINT.</span>
                <h2 class="banner-heading">You'll look and feel like the champion.</h2>
            </div>
            <button class="banner-button">
                CHECK THIS OUT
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
        </div>
    </div>
`

function getBannerIndex() {
	return window.innerWidth > 768 ? 5 : 4
}

async function loadProducts() {
	try {
		const response = await fetch(`${apiUrl}${currentPage}&pageSize=${pageSize}`)
		const data = await response.json()
		const products = data.data

		const bannerIndex = getBannerIndex()

		products.forEach(product => {
			productCount++

			const productCard = document.createElement('div')
			productCard.classList.add('product-card')
			productCard.innerHTML = `
                <span class="product-id">ID: ${product.id}</span>
                <img src="${product.image}" alt="${product.text}" loading="lazy">
            `
			productContainer.appendChild(productCard)

			if (!bannerInserted && productCount === bannerIndex) {
				productContainer.insertAdjacentHTML('beforeend', bannerHTML)
				bannerInserted = true
			}
		})

		currentPage++
		loading = false
	} catch (error) {
		console.error('Błąd ładowania produktów:', error)
		loading = false
	}
}

// Infinite scroll
window.addEventListener('scroll', () => {
	const { scrollTop, scrollHeight, clientHeight } = document.documentElement
	if (!loading && scrollTop + clientHeight >= scrollHeight - 50) {
		loading = true
		loadProducts()
	}
})

// Dropdown toggle
dropdownToggle.addEventListener('click', () => {
	dropdownMenu.classList.toggle('show')
	dropdownToggle.querySelector('img').classList.toggle('rotate')
})

// Dropdown option change
dropdownMenu.querySelectorAll('li').forEach(option => {
	option.addEventListener('click', () => {
		pageSize = parseInt(option.textContent.trim())
		document.getElementById('dropdownValue').textContent = option.textContent.trim()
		dropdownMenu.classList.remove('show')
		dropdownToggle.querySelector('img').classList.remove('rotate')

		productContainer.innerHTML = ''
		currentPage = 1
		productCount = 0
		bannerInserted = false
		loadProducts()
	})
})

// Inicjalizacja
window.addEventListener('DOMContentLoaded', () => loadProducts())

// Obsługa zmiany rozmiaru ekranu
window.addEventListener('resize', () => {
	clearTimeout(window.resizeTimeout)
	window.resizeTimeout = setTimeout(() => {
		productContainer.innerHTML = ''
		currentPage = 1
		productCount = 0
		bannerInserted = false
		loadProducts()
	}, 300)
})

// =======================
// POPUP
// =======================
const popupOverlay = document.getElementById('popupOverlay')
const popup = document.getElementById('popup')
const popupTitle = popup.querySelector('.popup-title')
const popupImage = popup.querySelector('.popup-content img')
const popupClose = popup.querySelector('.popup-close')

productContainer.addEventListener('click', event => {
	const productCard = event.target.closest('.product-card')
	if (!productCard) return

	const productId = productCard.querySelector('.product-id').textContent
	const productImage = productCard.querySelector('img').getAttribute('src')

	popupTitle.textContent = productId
	popupImage.setAttribute('src', productImage)

	popupOverlay.style.display = 'block'
	popup.style.display = 'block'
})

popupOverlay.addEventListener('click', closePopup)
popupClose.addEventListener('click', closePopup)

function closePopup() {
	popupOverlay.style.display = 'none'
	popup.style.display = 'none'
}
