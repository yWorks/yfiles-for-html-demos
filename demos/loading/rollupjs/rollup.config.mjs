import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import postcss from 'rollup-plugin-postcss'
import postcssUrl from 'postcss-url'
import optimizer from '@yworks/optimizer/rollup-plugin'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(rootDir, 'dist')

fs.rmSync(distDir, { recursive: true, force: true })
fs.mkdirSync(distDir)

fs.copyFileSync(path.join(rootDir, 'index.html'), path.join(distDir, 'index.html'))

const plugins = [
  replace({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    preventAssignment: true
  }),
  postcss({ extract: true, plugins: [postcssUrl({ url: 'inline' })] }),
  nodeResolve(),
  json(),
  commonjs()
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(optimizer({ logLevel: 'info' }), terser())
}

export default {
  plugins,
  onwarn(warning) {
    if (warning.code !== 'THIS_IS_UNDEFINED') {
      console.log(warning.message)
    }
  },
  input: { bundle: 'src/RollupJsDemo.js', LayoutWorker: 'src/LayoutWorker.js' },
  output: { dir: distDir, format: 'esm' }
}
