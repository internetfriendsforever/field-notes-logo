import { sum } from './math'

export default function update (shapes) {
  shapes.forEach(shape => {
    if (!shape.resting) {
      const { velocity } = shape

      const movement = sum([
        shape.velocity.angle,
        shape.velocity.position.x,
        shape.velocity.position.y
      ].map(v => Math.abs(v)))

      const rest = movement < 0.1
      const lightness = Math.min(shape.instrument.gain.gain.value * 1e10, 50)

      // const lightness = shape.instrument.gain.gain.value > 1e-8 ? 50 : 0

      if (!rest) {
        shape.polygon.style.fill = `hsl(${shape.hue}, 100%, ${lightness}%)`
        shape.angle += velocity.angle
        shape.position.x += velocity.position.x
        shape.position.y += velocity.position.y

        shape.angle *= 0.9
        shape.position.x *= 0.9
        shape.position.y *= 0.9

        velocity.angle *= 0.995
        velocity.position.x *= 0.995
        velocity.position.y *= 0.995
      } else {
        shape.angle = 0
        shape.position.x = 0
        shape.position.y = 0
        shape.resting = true
        shape.polygon.style.fill = `black`
      }
    }
  })
}
