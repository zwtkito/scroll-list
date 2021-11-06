import { defineConfig } from 'rollup'
import { resolve } from 'path'
import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import pkg from './package.json'

const config = defineConfig([
  {
    input: resolve('index.ts'),
    output: [
      {
        file: 'dist/index.js',
        format: 'es'
      }
    ],
    plugins: [
      typescript(),
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**'
      })
    ]
  },
  {
    input: resolve('index.ts'),
    output: {
      file: resolve('./', pkg.types),
      format: 'es'
    },
    plugins: [dts()]
  }
])

export default config
