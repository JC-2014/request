import util from './util'

let localCache = {}

let RqStatus = {
  PENDING: 'pending',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  FAIL: 'fail'
}

let $ = window.jQuery || function () {}
let failAlert = window.alert || function () {}
let errorAlert = window.alert || function () {}
let defaultMsg = '操作失败，请稍后重试。'

function request ( url, query, options = {} ) {
  let deferred = $.Deferred()

  let c = {}
  let needCache = options.cacheData
  let cacheTime = options.cacheTime

  delete options.cacheData
  delete options.cacheTime


  if ( needCache ) {
    c = getLocalCacheByQuery( url, query )

    if ( cacheTime ) {
      c = resetStatusByCompareCacheTime( c, cacheTime )
    }

    if ( c.status === RqStatus.PENDING ) {
      c.status = RqStatus.LOADING
      c.deferred = deferred
    } else {
      return cacheStatusHandler( c, deferred )
    }
  }

  $.ajax( extendOpts( url, query, options, deferred, needCache, c ) )

  return deferred
}

request.install = ( options = {} ) => {
  $ = options.jQuery || $
  failAlert = options.failAlert || failAlert
  errorAlert = options.errorAlert || errorAlert
  defaultMsg = options.defaultMsg || defaultMsg
}

function getLocalCacheByQuery ( url, query ) {
  let cacheData = localCache[ url ]

  if ( Array.isArray( cacheData ) ) {
    let match = cacheData.filter(cache => {
      return util.deepEquals( cache.query, query )
    })

    return match.length ? match[ 0 ] : addNewCacheAndReturn( cacheData, query )
  } else {
    cacheData = localCache[url] = []
    return addNewCacheAndReturn( cacheData, query )
  }
}

function resetStatusByCompareCacheTime ( c, cacheTime ) {
  let date = c.date

  if ( !date ) return c

  // 分钟数
  let interval = parseInt((new Date() - date) / 1000) / 60

  if ( interval >= cacheTime ) {
    c.date = null
    c.status = RqStatus.PENDING
  }

  return c
}

function addNewCacheAndReturn ( c, query ) {
  let len = c.push({
    query,
    date: null,
    cache: null,
    status: 'pending',
    deferred: null
  })

  return c[len - 1]
}

function cacheStatusHandler ( c, deferred ) {
  let { cache, status } = c

  if ( status === RqStatus.LOADING ) {
    return c.deferred
  }

  if ( status === RqStatus.SUCCESS ) {
    deferred.resolveWith( deferred, [ cache ] )
    return deferred
  }

  if ( status === RqStatus.ERROR || status === RqStatus.FAIL ) {
    deferred.rejectWith( deferred, [ cache ] )
    return deferred
  }
}

function extendOpts ( url, data, options, deferred, needCache, c ) {
  return $.extend({
    url,
    data,
    type: 'post',
    dataType: 'json',
    xhrFields: {
      withCredentials: true
    },
    success ( res, status, xhr ) {
      ajaxSuccCb( deferred, res, status, xhr, needCache, c )
    },
    error (xhr) {
      ajaxFailCb( deferred, url, xhr, needCache, c )
    }
  }, options)
}

function ajaxSuccCb ( deferred, res, status, xhr, needCache, c ) {
  if ( !util.isObject( res ) ) return console.log( errorMsg )

  let resData = null
  let requestStatus = null

  if ( res.code === 200 ) {
    resData = res.result
    requestStatus = RqStatus.SUCCESS

    // 记录缓存开始时间
    c.date = new Date()

    deferred.resolveWith( xhr, [ resData, res ] )
  } else {
    let msg = res.msg || errorMsg
    errorAlert && errorAlert( msg )

    resData = msg
    requestStatus = RqStatus.ERROR

    deferred.rejectWith( xhr, [ res ] )
  }

  if ( needCache ) {
    c.cache = resData
    c.status = requestStatus
    c.deferred = null
  }
}

function ajaxFailCb ( deferred, url, xhr, needCache, c ) {
  let msg = '请求' + url + '失败: ' + xhr.responseText
  console.error( msg )
  failAlert && failAlert( msg )

  deferred.rejectWith( xhr )

  if ( needCache ) {
    c.cache = msg
    c.status = RqStatus.FAIL
    c.deferred = null
  }
}

export default request
