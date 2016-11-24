request
===
request js on jquery (with cache)

install
---
    npm i request-cache-js --s

usage
---
# 直接在页面中
    <script src="xxx/module/dist/request.min.js"></script>
    window.Rq()
# import、require
    import request from 'request-cache-js'

    import $ from 'jQuery'
    request.install({
      jQuery: $,        // jquery
      failAlert: null,  // 请求失败的消息提示Fn
      errorAlert: null, // 请求返回出错的消息提示Fn
      defaultMsg: ''    // 默认出错消息
    })

# request(api, params, options)
  api: 请求的url
  params: 入参
  options: jquery Ajax 的配置写在这里，{ cacheData: true, cacheTime: 10 } 设置需要缓存，缓存间隔时间大于10分钟则重新拉取

# result
    request('xx/xx/xx', { id: 1 }).done( res => {
      // 请求成功
    }).fail( res => {
      // 请求返回错误或请求失败
    })