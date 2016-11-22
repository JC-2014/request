function isObject (o) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

function deepEquals (a, b) {
  let keys = Object.keys
  let isArray = Array.isArray

  let allAreArray = Array.isArray(a) && Array.isArray(b)
  let allAreObject = isObject(a) && isObject(b)

  if (!allAreArray && !allAreObject) {
    return Object.is(a, b)
  }

  // array
  if (allAreArray) {
    // sort
    a.sort()
    b.sort()

    let aArrLen = a.length
    if (aArrLen !== b.length) return false

    while (aArrLen--) {
      if (!deepEquals(a[aArrLen], b[aArrLen])) return false
    }
  }

  // object
  if (allAreObject) {
    let aKeys = keys(a)
    let aKeysLen = aKeys.length
    if (aKeysLen !== keys(b).length) return false

    while (aKeysLen--) {
      let key = aKeys[aKeysLen]
      if (!(b.hasOwnProperty(key) && deepEquals(a[key], b[key]))) return false
    }
  }

  return true
}

export default { isObject, deepEquals }
