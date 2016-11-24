import babel from 'rollup-plugin-babel'
import babelrc from 'babelrc-rollup'
import eslint from 'rollup-plugin-eslint'
import istanbul from 'rollup-plugin-istanbul'
import uglify from 'rollup-plugin-uglify'

let pkg = require('./package.json')

export default {
  entry: 'src/main.js',
  plugins: [
    eslint(),
    babel(babelrc()),
    istanbul({
      exclude: ['test/**/*', 'node_modules/**/*']
    }),
    uglify()
  ],
  dest: pkg['main'],
  format: 'umd',
  moduleName: 'Rq',
  sourceMap: true
}
