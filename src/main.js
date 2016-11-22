import $ from 'jquery'
import { deepEquals, isObject } from 'util'

export default request

let localCache = {}

function request (url, query, options) {
  let deferred = $.Deferred()

  let needCache = options.cacheData === true
  delete options.cacheData

  let cacheData = {}
  if (needCache) {
    cacheData = getLocalCacheByUrl(url, query)

    if (cacheData.status === 'pending') {
      cacheData.status = 'loading'
      cacheData.deferred = deferred
    } else {
      return cacheStatusHandler(cacheData, deferred)
    }
  }

  $.ajax(extendOpts(url, query, options, deferred, needCache, cacheData))

  return deferred
}

function getLocalCacheByUrl (url, query) {
  let cacheData = localCache[url]

  if (cacheData && Array.isArray(cacheData)) {
    let matchCache = cacheData.filter(cache => {
      return deepEquals(cache.query, query)
    })

    if (matchCache.length) {
      return matchCache[0]
    } else {
      return addNewCacheAndReturn(cacheData, query)
    }
  } else {
    cacheData = localCache[url] = []
    return addNewCacheAndReturn(cacheData, query)
  }
}

function addNewCacheAndReturn (cacheData, data) {
  let len = cacheData.length

  let defaultCache = {
    query: data,
    status: 'pending',
    cache: null,
    deferred: null
  }

  cacheData.push(defaultCache)

  return cacheData[len]
}

function cacheStatusHandler (cacheData, deferred) {
  // 请求状态 ['pending', 'loading', 'success', 'error', 'fail']
  let cache = cacheData.cache
  let status = cacheData.status

  if (status === 'loading') {
    return cacheData.deferred
  }

  if (status === 'success') {
    deferred.resolveWith(deferred, [ cache ])
    return deferred
  }

  if (status === 'error' || status === 'fail') {
    deferred.rejectWith(deferred, [ cache ])
    return deferred
  }
}

function extendOpts (url, data, options, deferred, needCache, cacheData) {
  return $.extend({
    url,
    data,
    type: 'post',
    dataType: 'json',
    xhrFields: {
      withCredentials: true
    },
    success (res, status, xhr) {
      ajaxSuccCb(deferred, res, status, xhr, needCache, cacheData)
    },
    error (xhr) {
      ajaxFailCb(deferred, url, xhr, needCache, cacheData)
    }
  }, options)
}

function ajaxSuccCb (deferred, res, status, xhr, needCache, cacheData) {
  const errorMsg = '操作失败，请稍后重试。'

  if (!isObject(res)) return console.log(errorMsg)

  let resData = null
  let requestStatus = null

  if (res.code === 200) {
    deferred.resolveWith(xhr, [ res.result, res ])

    resData = res.result
    requestStatus = 'success'
  } else {
    let msg = res.msg || errorMsg
    console.log(msg)

    deferred.rejectWith(xhr, [ res ])

    resData = msg
    requestStatus = 'error'
  }

  if (needCache) {
    cacheData.cache = resData
    cacheData.status = requestStatus
    cacheData.deferred = null
  }
}

function ajaxFailCb (deferred, url, xhr, needCache, cacheData) {
  let msg = '请求' + url + '失败: ' + xhr.responseText
  console.error(msg)

  deferred.rejectWith(xhr)

  if (needCache) {
    cacheData.cache = msg
    cacheData.status = 'fail'
    cacheData.deferred = null
  }
}
