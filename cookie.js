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

let upgradesOpen = false

function openUpgrades() {
  upgradesOpen = !upgradesOpen
  UI.upgradesContainer.classList.toggle('open')
  UI.container.classList.toggle('open')
  UI.openUpgrades.classList.toggle('open')

  // UI.upgradesContainer.style.width = upgradesOpen ? '100%' : '0'
  // if (window.innerWidth < 800) {
    // UI.container.style.width = upgradesOpen ? '0' : '100%'
  // }
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

function windowResizeCallback() {
  resetRainingCookiesXCoordinates()
}

let start = 0
function update(now) {
  const dt = (now - start) / 1000
  start = now

  UI.score.innerText = Math.floor(gameData.score)

  for (const upgrade in upgrades) {
    updateUpgradeUI(upgrade, upgradeElements[upgrade])
    gameData.score += calculateCookiesPerSecond(upgrades[upgrade].baseCookiesPerSecond, gameData.upgrades[upgrade].ammount) * dt
  }

  updateRainingCookies()
  requestAnimationFrame(update)
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
  const totalPrice =  price * ammountToBuy

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

function main() {
  UI.container = document.getElementById('container')
  UI.score = document.getElementById('score')
  UI.cookieRain = document.getElementById('cookie-rain')
  UI.bigCookie = document.getElementById('big-cookie')
  UI.bigCookieContainer = document.getElementById('big-cookie-container')
  UI.upgradesContainer = document.getElementById('upgrades-container')
  UI.upgrades = document.getElementById('upgrades')
  UI.openUpgrades = document.getElementById('open-upgrades')

  for (const upgrade in upgrades) {
    gameData.upgrades[upgrade] = {
      ammount: 0,
      multiplier: 1,
    }
    upgradeElements[upgrade] = createUpgradeUI(upgrade)
  }

  window.addEventListener('resize', windowResizeCallback)

  initCookieRain(UI.cookieRain)

  loadGameData()

  setInterval(() => {
    saveGameData()
  }, 5000)

  start = performance.now()
  requestAnimationFrame(update)
}

window.onload = main
