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

  logo.style.width = '100%'
  logo.style.height = '100%'

  const shapes = map(polygons, polygon => {
    const instrument = createInstrument(context)
    const hue = hues[~~(Math.random() * hues.length)]

    instrument.connect(convolver)

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

  const onMouseMove = (() => {
    const previous = logo.createSVGPoint()
    const current = logo.createSVGPoint()

    previous.x = null
    previous.y = null

    return e => {
      current.x = e.clientX
      current.y = e.clientY

      if (previous.x !== 0) {
        const a = previous.matrixTransform(logo.getScreenCTM().inverse())
        const b = current.matrixTransform(logo.getScreenCTM().inverse())
        const mouseLine = [[a.x, a.y], [b.x, b.y]]

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
              const force = Math.pow(mouseLength, 1.2) / 5

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

      previous.x = current.x
      previous.y = current.y
    }
  })()

  let ticking = false

  function tick () {
    ticking = true

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
      tick()
    }
  }

  window.addEventListener('mousemove', onMouseMove)
}
