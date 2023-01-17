const COOKIE_RAIN_COUNT = 50
const RAINING_COOKIE_MIN_SPEED = 4
const RAINING_COOKIE_MAX_SPEED = 10
const RAINING_COOKIE_MAX_ACCELERATION = 1
const RAINING_COOKIE_MIN_ACCELERATION = 0.75
const RAINING_COOKIE_MAX_WIDTH = 0.015 // Percentage of viewport width

const BIG_COOKIE_ANIMATION_DURATION = 50

const multiplierOrder = [
  1, 10, 100, -1  // -1 == MAX
]

const upgrades = {
  'MO COOKIES': {
    title: 'MO COOKIES',
    basePrice: 5,
    baseCookiesPerSecond: 5,
    image: 'assets/cookie128x128.png'
  },
  'EVEN MO COOKS': {
    title: 'EVEN MO COOKS',
    basePrice: 69,
    baseCookiesPerSecond: 69,
    image: 'assets/cookie128x128.png'
  }
}

const upgradeElements = {}

const UI = {
  container: null,
  score: null,
  cookieRain: null,
  bigCookie: null,
  bigCookieContainer: null,
  upgradesContainer: null,
  upgrades: null,
  openUpgrades: null,
}

let gameData = {
  clickCount: 0,
  score: 0,
  upgrades: {}
}

const rainingCookies = []

let upgradesOpen = false
let startTime = 0

function createRainingCookie() {
  const element = document.createElement('img')
  element.className = `cookie ${Math.random() >= 0.5 ? 'spin-clockwise' : 'spin-counterclockwise'}`
  element.src = 'assets/cookie32x32.png'

  UI.cookieRain.appendChild(element)

  return {
    x: 0,
    y: window.innerHeight + 1,
    ySpeed: 0,
    yAcelleration: 0,
    element
  }
}

function cookieRain() {
  rainingCookies.forEach(cookie => {
    // Only reset cookies that are out of the window or completely stopped
    if (cookie.y > window.innerHeight || cookie.ySpeed <= 0) {
      cookie.x = Math.random() * window.innerWidth
      cookie.y = -(Math.random() * 0.5 * window.innerHeight)
      cookie.ySpeed = Math.max(Math.random() * RAINING_COOKIE_MAX_SPEED, RAINING_COOKIE_MIN_SPEED)
      cookie.yAcceleration = -(Math.max(Math.random() * RAINING_COOKIE_MAX_ACCELERATION, RAINING_COOKIE_MIN_ACCELERATION))
    }
  })
}


function openUpgrades() {
  upgradesOpen = !upgradesOpen
  UI.upgradesContainer.classList.toggle('open')
  UI.container.classList.toggle('open')
  UI.openUpgrades.classList.toggle('open')
}

function handleCookieClick() {
  gameData.clickCount = (gameData.clickCount + 1) % 10
  gameData.score++;

  if (gameData.clickCount == 0) {
    cookieRain()

    UI.score.style.transform = 'scale(1.1)';
    setTimeout(() => {
      UI.score.style.transform = 'scale(1.0)';
    }, BIG_COOKIE_ANIMATION_DURATION)
  }

  UI.bigCookieContainer.style.transform = 'scale(1.1)';

  setTimeout(() => {
    UI.bigCookieContainer.style.transform = 'scale(1.0)';
  }, BIG_COOKIE_ANIMATION_DURATION)
}

function calculatePrice(basePrice, ammount) {
  return basePrice + basePrice * ammount
}

function calculateCookiesPerSecond(baseCookiesPerSecond, ammount) {
  return baseCookiesPerSecond * ammount
}

function createUpgradeUI(upgrade) {
  const upgradeInfo = upgrades[upgrade]

  const template = document.getElementById('upgrade-template')
  const element = template.content.cloneNode(true)

  const title = element.querySelector('.upgrade-title')
  const image = element.querySelector('.upgrade-image')
  const button = element.querySelector('.upgrade-button')
  const multiplierElem = element.querySelector('.upgrade-button-multiplier')

  title.innerText = upgradeInfo.title
  image.src = upgradeInfo.image
  button.addEventListener('click', () => {
    const upgradeData = gameData.upgrades[upgrade]
    const price = calculatePrice(upgradeInfo.basePrice, upgradeData.ammount)
    const ammountToBuy = upgradeData.multiplier > 0 ? gameData.upgrades[upgrade].multiplier : Math.floor(gameData.score / price)

    const newScore = gameData.score - ammountToBuy * price;

    if (newScore >= 0) {
      gameData.score = newScore
      gameData.upgrades[upgrade].ammount += ammountToBuy
    }
  })

  multiplierElem.addEventListener('click', () => {
    const idx = (multiplierOrder.indexOf(gameData.upgrades[upgrade].multiplier) + 1) % multiplierOrder.length
    gameData.upgrades[upgrade].multiplier = multiplierOrder[idx]
  })

  updateUpgradeUI(upgrade, element)

  // This wrapper div is needed to store a reference to the actual element in the DOM, otherwise it would be just a DocumentFragment and acessing it would be meaningless (I guess)
  const div = document.createElement('div')
  div.appendChild(element)
  UI.upgrades.appendChild(div)

  return div
}

function updateUpgradeUI(upgrade, upgradeElement) {
  const upgradeInfo = upgrades[upgrade]
  const upgradeData = gameData.upgrades[upgrade]
  const ammount = upgradeData.ammount
  const multiplier = upgradeData.multiplier

  const multiplierElem = upgradeElement.querySelector('.upgrade-button-multiplier')
  const button = upgradeElement.querySelector('.upgrade-button')
  const cookiesPerSecond = upgradeElement.querySelector('.upgrade-cookies-per-second')
  const ammountElem = upgradeElement.querySelector('.upgrade-ammount')

  const price = calculatePrice(upgradeInfo.basePrice, upgradeData.ammount)
  const ammountToBuy = upgradeData.multiplier > 0 ? upgradeData.multiplier : Math.floor(gameData.score / price)
  const totalPrice = price * ammountToBuy

  multiplierElem.innerText = multiplier > 0 ? `x${multiplier}` : 'MAX'
  button.innerText = `🍪${totalPrice}`

  if (totalPrice > gameData.score || totalPrice == 0) {
    button.classList.add('disabled')
  } else {
    button.classList.remove('disabled')
  }

  cookiesPerSecond.innerText = `🍪/s ${calculateCookiesPerSecond(upgradeInfo.baseCookiesPerSecond, ammount)}`
  ammountElem.innerText = `x${ammount}`
}

function loadGameData() {
  const data = localStorage.getItem('gameData')
  if (data) {
    gameData = JSON.parse(localStorage.getItem('gameData'))
  }
}

function saveGameData() {
  localStorage.setItem('gameData', JSON.stringify(gameData))
}

function windowResizeCallback() {
  rainingCookies.forEach(cookie => {
    cookie.x = Math.random() * window.innerWidth
  })
}

function updateRainingCookies() {
  rainingCookies.forEach(cookie => {
    if (cookie.y <= window.innerHeight && cookie.ySpeed > 0) {
      cookie.y += cookie.ySpeed
      cookie.ySpeed += cookie.yAcelleration
    }

    const yPercent = 0.9 * (window.innerHeight - cookie.y + (window.innerHeight * 0.3)) / window.innerHeight

    cookie.element.style.width = `${yPercent * window.innerWidth * RAINING_COOKIE_MAX_WIDTH}px`
    cookie.element.style.left = `${cookie.x}px`
    cookie.element.style.top = `${cookie.y}px`
    cookie.element.style.opacity = `${yPercent}`
  })
}

function update(now) {
  // Delta timing
  const dt = (now - startTime) / 1000
  startTime = now

  // Update UI
  UI.score.innerText = Math.floor(gameData.score)

  for (const upgrade in upgrades) {
    updateUpgradeUI(upgrade, upgradeElements[upgrade])
    gameData.score += calculateCookiesPerSecond(upgrades[upgrade].baseCookiesPerSecond, gameData.upgrades[upgrade].ammount) * dt
  }

  updateRainingCookies()

  // Loop
  requestAnimationFrame(update)
}

function main() {
  // Get references to DOM elements
  UI.container = document.getElementById('container')
  UI.score = document.getElementById('score')
  UI.cookieRain = document.getElementById('cookie-rain')
  UI.bigCookie = document.getElementById('big-cookie')
  UI.bigCookieContainer = document.getElementById('big-cookie-container')
  UI.upgradesContainer = document.getElementById('upgrades-container')
  UI.upgrades = document.getElementById('upgrades')
  UI.openUpgrades = document.getElementById('open-upgrades')

  // Events
  window.addEventListener('resize', windowResizeCallback)

  // Init raining cookies
  for (let i = 0; i < COOKIE_RAIN_COUNT; i++) {
    rainingCookies.push(createRainingCookie())
  }

  // Initialize Game Data and UI
  for (const upgrade in upgrades) {
    gameData.upgrades[upgrade] = {
      ammount: 0,
      multiplier: 1,
    }
    upgradeElements[upgrade] = createUpgradeUI(upgrade)
  }

  loadGameData()

  // Setup data saving
  setInterval(() => {
    saveGameData()
  }, 5000)

  // Start game loop
  startTime = performance.now()
  requestAnimationFrame(update)
}

window.onload = main
