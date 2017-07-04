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

  const pointer = {
    current: logo.createSVGPoint(),
    previous: null
  }

  const pointerDebug = logo.querySelector('line')

  function tick () {
    if (pointer.current) {
      if (pointer.previous) {
        const pointerLine = [
          [pointer.previous.x, pointer.previous.y],
          [pointer.current.x, pointer.current.y]
        ]

        pointerDebug.style.visibility = 'visible'
        pointerDebug.setAttribute('x1', pointerLine[0][0])
        pointerDebug.setAttribute('y1', pointerLine[0][1])
        pointerDebug.setAttribute('x2', pointerLine[1][0])
        pointerDebug.setAttribute('y2', pointerLine[1][1])

        forEach(shapes, shape => {
          const mouseLength = math.lineLength(pointerLine)
          const mouseAngle = math.lineAngle(pointerLine)
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

            if (math.linesIntersect(pointerLine, shapeLine)) {
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
      } else {
        pointer.previous = logo.createSVGPoint()
      }

      pointer.previous.x = pointer.current.x
      pointer.previous.y = pointer.current.y
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

  function toLocalSVGPoint (global) {
    const point = logo.createSVGPoint()
    point.x = global.x
    point.y = global.y
    return point.matrixTransform(logo.getScreenCTM().inverse())
  }

  function onTouchStart (e) {
    e.preventDefault()

    pointer.current = null
    pointer.previous = null

    function onTouchMove (e) {
      pointer.current = toLocalSVGPoint({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      })

      start()
    }

    function onTouchEnd () {
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }

    if (e.touches.length === 1) {
      document.addEventListener('touchmove', onTouchMove)
      document.addEventListener('touchend', onTouchEnd)
    }
  }

  function onMouseMove (e) {
    pointer.current = toLocalSVGPoint({
      x: e.clientX,
      y: e.clientY
    })

    start()
  }

  if ('ontouchstart' in window) {
    logo.addEventListener('touchstart', onTouchStart)
  } else {
    logo.addEventListener('mousemove', onMouseMove)
  }

  // iOS enable
  document.addEventListener('touchstart', () => {
    const buffer = context.createBuffer(1, 1, 22050)
    const source = context.createBufferSource()

    source.buffer = buffer
    source.connect(context.destination)
    source.start(0)

    window.setTimeout(() => {
      if ((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
        document.body.style.background = 'lime'
      } else {
        document.body.style.background = 'red'
      }
    }, 0)
  }, false)
}
