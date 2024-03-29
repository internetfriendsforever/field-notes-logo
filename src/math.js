export function sum (arr) {
  return arr.reduce((acc, val) => acc + val, 0)
}

export function average (arr) {
  return sum(arr) / arr.length
}

export function distance (a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

export function getPolygonCentroid (polygon) {
  const centroid = { x: 0, y: 0 }
  const points = pointListToArray(polygon.points)
  centroid.x = average(points.map(point => point.x))
  centroid.y = average(points.map(point => point.y))
  return centroid
}

export function pointListToArray (list) {
  return Array(list.numberOfItems).fill().map((v, i) => (
    list.getItem(i)
  ))
}

export function getMatrixFromElement (from, to) {
  return from.getCTM().inverse().multiply(to.getCTM())
}

export function lineLength ([[x1, y1], [x2, y2]]) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

export function lineAngle ([[x1, y1], [x2, y2]]) {
  return Math.atan2(y2 - y1, x2 - x1)
}

export function linesIntersect ([[x1, y1], [x2, y2]], [[x3, y3], [x4, y4]]) {
  const x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))
  const y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))

  if (isNaN(x) || isNaN(y)) {
    return false
  } else {
    if (x1 >= x2) {
      if (!(x2 <= x && x <= x1)) {
        return false
      }
    } else {
      if (!(x1 <= x && x <= x2)) {
        return false
      }
    }

    if (y1 >= y2) {
      if (!(y2 <= y && y <= y1)) {
        return false
      }
    } else {
      if (!(y1 <= y && y <= y2)) {
        return false
      }
    }

    if (x3 >= x4) {
      if (!(x4 <= x && x <= x3)) {
        return false
      }
    } else {
      if (!(x3 <= x && x <= x4)) {
        return false
      }
    }

    if (y3 >= y4) {
      if (!(y4 <= y && y <= y3)) {
        return false
      }
    } else {
      if (!(y3 <= y && y <= y4)) {
        return false
      }
    }
  }

  return true
}
