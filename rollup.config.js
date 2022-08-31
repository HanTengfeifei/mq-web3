import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import packageJSON from './package.json';
import { terser } from 'rollup-plugin-terser';
import snaps from '@metamask/rollup-plugin-snaps';
import execute from 'rollup-plugin-execute';
// const execute = require('rollup-plugin-execute');
// const snaps = require('@metamask/rollup-plugin-snaps').default;
// const execute = require('rollup-plugin-execute');

const getPath = (_path) => path.resolve(__dirname, _path);

const isDev = process.env.ROLLUP_WATCH || false;

const extensions = ['.js', '.ts', '.tsx'];

// ts

// eslint
const esPlugin = eslint({
  throwOnError: true,
  include: ['src/**/*.ts'],
  exclude: ['node_modules/**', 'lib/**', 'dist/**'],
});

// 基础配置
const commonConf = {
  input: getPath('./src/index.js'),
  plugins: [
    snaps(),
    execute(['yarn manifest', 'yarn eval']),
    resolve({ browser: true }, extensions),
    commonjs(),
    esPlugin,
    // tsPlugin,
    !isDev && terser(),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss'],
      exclude: '**/node_modules/**',
    }),
  ],
  external: ['@protobuf-ts/plugin', 'js-sha3', '@noble/ed25519'],
};

// 需要导出的模块类型
const outputMap = [
  {
    file: packageJSON.main,
    format: 'esm',
    globals: {
      '@noble/ed25519': 'ed',
      '@protobuf-ts/plugin': 'pb',
      'js-sha3': 'js-sha3',
    },
    sourcemap: true,
  },
  // {
  //   file: packageJSON.module,
  //   format: 'es',
  //   globals: {
  //     axios: 'Axios',
  //     mqtt: 'mqtt',
  //   },
  // },
];

const buildConf = (options) => Object.assign({}, commonConf, options);

const webConfig = {
  input: './src/index.ts',
  output: {
    file: './dist/main.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [babel({ babelHelpers: 'bundled', extensions: ['.ts'] })],
};
export default outputMap.map((output) =>
  buildConf({ output: { name: packageJSON.name, ...output } }),
);
