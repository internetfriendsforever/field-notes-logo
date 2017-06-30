export default function render (shapes) {
  shapes.forEach(shape => {
    const { angle, position, centroid } = shape

    const transforms = [
      `rotate(${angle} ${centroid.x + position.x} ${centroid.y + position.y})`,
      `translate(${position.x} ${position.y})`
    ]

    const transform = transforms.join(' ')

    shape.polygon.setAttribute('transform', transform)
  })
}
