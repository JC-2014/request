import util from './util'

let localCache = {}

let RqStatus = {
  PENDING: 'pending',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  FAIL: 'fail'
}

let $ = window.jQuery || null
let failAlert = window.alert || null
let errorAlert = window.alert || null
let defaultMsg = '操作失败，请稍后重试。'

function request ( url, query, options = {} ) {
  let deferred = $.Deferred()

  let { needCache = false , cacheTime = null } = options

  delete options.cacheData
  delete options.cacheTime

  let cacheData = {}

  if ( needCache ) {
    cacheData = getLocalCacheByUrl( url, query )

    if ( cacheTime ) {
      cacheData = resetStatusByCompareCacheTime( cacheData, cacheTime )
    }

    if ( cacheData.status === RqStatus.PENDING ) {
      cacheData.status = RqStatus.LOADING
      cacheData.deferred = deferred
    } else {
      return cacheStatusHandler( cacheData, deferred )
    }
  }

  $.ajax( extendOpts( url, query, options, deferred, needCache, cacheData ) )

  return deferred
}

request.install = ( options = {} ) => {
  $ = options.jQuery
  failAlert = options.failAlert
  errorAlert = options.errorAlert
  defaultMsg = options.defaultMsg
}

function getLocalCacheByUrl ( url, query ) {
  let cacheData = localCache[ url ]

  if ( cacheData && Array.isArray( cacheData ) ) {
    let match = cacheData.filter(cache => {
      return util.deepEquals( cache.query, query )
    })

    return match.length ? match[ 0 ] : addNewCacheAndReturn( cacheData, query )
  } else {
    cacheData = localCache[url] = []
    return addNewCacheAndReturn( cacheData, query )
  }
}

function resetStatusByCompareCacheTime ( cacheData, cacheTime ) {
  let date = cacheData.date

  if ( !date ) return cacheData

  // 分钟数
  let interval = parseInt((new Date() - date) / 1000) / 60

  if ( interval >= cacheTime ) {
    cacheData.date = null
    cacheData.status = RqStatus.PENDING
  }

  return cacheData
}

function addNewCacheAndReturn ( cacheData, query ) {
  let len = cacheData.push({
    query,
    date: null,
    cache: null,
    status: 'pending',
    deferred: null
  })

  return cacheData[len - 1]
}

function cacheStatusHandler ( cacheData, deferred ) {
  let { cache, status } = cacheData

  if ( status === RqStatus.LOADING ) {
    return cacheData.deferred
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

function extendOpts ( url, data, options, deferred, needCache, cacheData ) {
  return $.extend({
    url,
    data,
    type: 'post',
    dataType: 'json',
    xhrFields: {
      withCredentials: true
    },
    success ( res, status, xhr ) {
      ajaxSuccCb( deferred, res, status, xhr, needCache, cacheData )
    },
    error (xhr) {
      ajaxFailCb( deferred, url, xhr, needCache, cacheData )
    }
  }, options)
}

function ajaxSuccCb ( deferred, res, status, xhr, needCache, cacheData ) {
  if ( !util.isObject( res ) ) return console.log( errorMsg )

  let resData = null
  let requestStatus = null

  if ( res.code === 200 ) {
    resData = res.result
    requestStatus = RqStatus.SUCCESS

    // 记录缓存开始时间
    cacheData.date = new Date()

    deferred.resolveWith( xhr, [ resData, res ] )
  } else {
    let msg = res.msg || errorMsg
    errorAlert( msg )

    resData = msg
    requestStatus = RqStatus.ERROR

    deferred.rejectWith( xhr, [ res ] )
  }

  if ( needCache ) {
    cacheData.cache = resData
    cacheData.status = requestStatus
    cacheData.deferred = null
  }
}

function ajaxFailCb ( deferred, url, xhr, needCache, cacheData ) {
  let msg = '请求' + url + '失败: ' + xhr.responseText
  console.error( msg )
  failAlert( msg )

  deferred.rejectWith( xhr )

  if ( needCache ) {
    cacheData.cache = msg
    cacheData.status = RqStatus.FAIL
    cacheData.deferred = null
  }
}

export default request
