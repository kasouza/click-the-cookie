const COOKIE_RAIN_COUNT = 50
const RAINING_COOKIE_MIN_SPEED = 4
const RAINING_COOKIE_MAX_SPEED = 10
const RAINING_COOKIE_MAX_ACCELERATION = 1
const RAINING_COOKIE_MIN_ACCELERATION = 0.75
const RAINING_COOKIE_MAX_WIDTH = 0.015 // Percentage of viewport width

const rainingCookies =[]
let cookieRainElement = null

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

function initCookieRain(element) {
  for (let i = 0 ;i < COOKIE_RAIN_COUNT; i++) {
    rainingCookies.push(createRainingCookie())
  }

  cookieRainElement = element
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

function updateRainingCookies() {
  rainingCookies.forEach(cookie => {
    if (cookie.y <= window.innerHeight && cookie.ySpeed > 0) {
      cookie.y += cookie.ySpeed
      cookie.ySpeed += cookie.yAcelleration
    }

    const yPercent =  0.9 * (window.innerHeight - cookie.y + (window.innerHeight * 0.3)) / window.innerHeight

    cookie.element.style.width = `${yPercent * window.innerWidth * RAINING_COOKIE_MAX_WIDTH}px`
    cookie.element.style.left = `${cookie.x}px`
    cookie.element.style.top = `${cookie.y}px`
    cookie.element.style.opacity = `${yPercent}`
  })
}

function resetRainingCookiesXCoordinates() {
  rainingCookies.forEach(cookie => {
      cookie.x = Math.random() * window.innerWidth
  })
}
