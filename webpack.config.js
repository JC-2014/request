module.exports = {
   entry: './src/main.js',
   output: {
       path: './dist',
       filename: 'request.min.js'
   },
   externals: {
    'jquery': 'window.jquery'
   },
   module: {
    // preLoaders: [
    //   {
    //     test: /\.js$/,
    //     loader: 'eslint',
    //     include: /src/
    //   }
    // ],
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: /src/
      }
    ]
   },
   eslint: {
    formatter: require('eslint-friendly-formatter')
  }
 }