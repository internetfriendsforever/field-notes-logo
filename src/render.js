export default function render (shapes) {
  shapes.forEach(shape => {
    const { angle, position, centroid } = shape

    const transforms = [
      `rotate(${angle} ${centroid.x + position.x} ${centroid.y + position.y})`,
      `translate(${position.x} ${position.y})`
    ]

    const transform = transforms.join(' ')
    const vibration = (1 - (Date.now() - shape.hitTime) / 100)
    const lightness = Math.min(50, Math.max(0, vibration * 50))

    shape.polygon.setAttribute('transform', transform)
    shape.polygon.style.fill = `hsl(${shape.hue}, 100%, ${lightness}%)`
  })
}
