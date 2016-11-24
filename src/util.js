function isObject ( o ) {
  return Object.prototype.toString.call( o ) === '[object Object]'
}

function deepEquals ( a, b ) {
  let { is, keys } = Object
  let isArray = Array.isArray

  let allAreArray = isArray( a ) && isArray( b )
  let allAreObject = isObject( a ) && isObject( b )

  if ( !allAreArray && !allAreObject ) {
    return is( a, b )
  }

  // array
  if ( allAreArray ) {
    // sort
    a.sort()
    b.sort()

    let aArrLen = a.length
    if ( aArrLen !== b.length ) return false

    while ( aArrLen-- ) {
      if ( !deepEquals( a[ aArrLen ], b[ aArrLen ] ) ) return false
    }
  }

  // object
  if ( allAreObject ) {
    let aKeys = keys( a )
    let aKeysLen = aKeys.length
    if ( aKeysLen !== keys( b ).length ) return false

    while ( aKeysLen-- ) {
      let key = aKeys[ aKeysLen ]
      if ( !( b.hasOwnProperty( key ) && deepEquals( a[ key ], b[ key ] ) ) ) return false
    }
  }

  return true
}

export default { isObject, deepEquals }
