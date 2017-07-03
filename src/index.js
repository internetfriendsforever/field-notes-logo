import createInstrument from './createInstrument'
import * as math from './math'
import update from './update'
import render from './render'
import echo from './assets/SteinmanHall-AAC File.m4a'
import svg from './assets/logo.svg'

const map = (target, fn) => Array.prototype.map.call(target, fn)
const forEach = (target, fn) => Array.prototype.forEach.call(target, fn)

const context = new (window.AudioContext || window.webkitAudioContext)()
const convolver = context.createConvolver()

convolver.connect(context.destination)

context.decodeAudioData(echo, buffer => {
  convolver.buffer = buffer
})

module.exports = function ({ container, hues }) {
  container.innerHTML = svg

  const logo = container.querySelector('svg')
  const polygons = logo.querySelectorAll('polygon')
  const letters = logo.querySelector('g')

  const instruments = Array(8).fill().map(() => createInstrument(context))

  instruments.forEach(instrument => instrument.connect(convolver))

  logo.style.width = '100%'
  logo.style.height = '100%'

  const shapes = map(polygons, polygon => {
    const instrument = instruments[~~(Math.random() * instruments.length)]
    const hue = hues[~~(Math.random() * hues.length)]

    return {
      polygon: polygon,
      instrument: instrument,
      centroid: math.getPolygonCentroid(polygon),
      hue: hue,
      resting: true,
      angle: 0,
      lastCollision: 0,
      position: { x: 0, y: 0 },
      velocity: {
        angle: 0,
        position: { x: 0, y: 0 }
      }
    }
  })

  let ticking = false
  let mouseLine = null

  const mouseDebug = logo.querySelector('line')

  function tick () {
    if (mouseLine) {
      mouseDebug.style.visibility = 'visible'
      mouseDebug.setAttribute('x1', mouseLine[0][0])
      mouseDebug.setAttribute('y1', mouseLine[0][1])
      mouseDebug.setAttribute('x2', mouseLine[1][0])
      mouseDebug.setAttribute('y2', mouseLine[1][1])
    } else {
      mouseDebug.style.visibility = 'hidden'
    }

    if (mouseLine) {
      forEach(shapes, shape => {
        const mouseLength = math.lineLength(mouseLine)
        const mouseAngle = math.lineAngle(mouseLine)
        const polygon = shape.polygon
        const points = polygon.points
        const relativeMatrix = math.getMatrixFromElement(letters, polygon)

        if (Date.now() - shape.lastCollision < 50) {
          return
        }

        Array(points.numberOfItems).fill().forEach((v, i) => {
          const a = points.getItem(i).matrixTransform(relativeMatrix)
          const b = points.getItem((i + 1) % points.numberOfItems).matrixTransform(relativeMatrix)

          const shapeLine = [[a.x, a.y], [b.x, b.y]]

          if (math.linesIntersect(mouseLine, shapeLine)) {
            const force = Math.min(Math.pow(mouseLength, 1.2) / 5, 20)

            shape.lastCollision = Date.now()
            shape.velocity.angle += force
            shape.velocity.position.x += Math.cos(mouseAngle) * force
            shape.velocity.position.y += Math.sin(mouseAngle) * force
            shape.resting = false

            shape.instrument.trigger(force / 10)

            start()
          }
        })
      })
    }

    if (shapes.some(shape => !shape.resting)) {
      update(shapes)
      render(shapes)
      window.requestAnimationFrame(tick)
    } else {
      ticking = false
    }
  }

  function start () {
    if (!ticking) {
      ticking = true
      tick()
    }
  }

  const onTouchStart = (() => {
    let ready = false
    let previous = logo.createSVGPoint()
    let current = logo.createSVGPoint()

    return e => {
      e.preventDefault()

      ready = false

      const onTouchMove = e => {
        previous.x = current.x
        previous.y = current.y
        current.x = e.touches[0].clientX
        current.y = e.touches[0].clientY

        if (ready) {
          const a = previous.matrixTransform(logo.getScreenCTM().inverse())
          const b = current.matrixTransform(logo.getScreenCTM().inverse())
          mouseLine = [[a.x, a.y], [b.x, b.y]]
          start()
        }

        ready = true
      }

      const onTouchEnd = () => {
        mouseLine = null
        document.removeEventListener('touchmove', onTouchMove)
        document.removeEventListener('touchend', onTouchEnd)
      }

      document.addEventListener('touchmove', onTouchMove)
      document.addEventListener('touchend', onTouchEnd)
    }
  })()

  const onMouseMove = (() => {
    let ready = false
    let previous = logo.createSVGPoint()
    let current = logo.createSVGPoint()

    return e => {
      previous.x = current.x
      previous.y = current.y
      current.x = e.clientX
      current.y = e.clientY

      if (ready) {
        const a = previous.matrixTransform(logo.getScreenCTM().inverse())
        const b = current.matrixTransform(logo.getScreenCTM().inverse())
        mouseLine = [[a.x, a.y], [b.x, b.y]]
        start()
      }

      ready = true
    }
  })()

  if ('ontouchstart' in window) {
    logo.addEventListener('touchstart', onTouchStart)
  } else {
    logo.addEventListener('mousemove', onMouseMove)
  }
}
