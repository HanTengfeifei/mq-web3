/*
 * @Author: HanTengfeifei 1157123521@qq.com
 * @Date: 2022-09-02 20:41:14
 * @LastEditors: HanTengfeifei 1157123521@qq.com
 * @LastEditTime: 2022-09-13 19:58:32
 * @FilePath: /mq-web3/rollup.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import packageJSON from './package.json';
import { terser } from 'rollup-plugin-terser';
import snaps from '@metamask/rollup-plugin-snaps';
import execute from 'rollup-plugin-execute';
// const execute = require('rollup-plugin-execute');
// const snaps = require('@metamask/rollup-plugin-snaps').default;
// const execute = require('rollup-plugin-execute');

const getPath = _path => path.resolve(__dirname, _path);

const isDev = process.env.ROLLUP_WATCH || false;

const extensions = ['.js', '.ts', '.tsx'];

// ts

// eslint
const esPlugin = eslint({
  throwOnError: true,
  include: ['src/**/*.js'],
  exclude: ['node_modules/**', 'lib/**', 'dist/**'],
});

// 基础配置
const commonConf = {
  input: getPath('./src/index.js'),
  plugins: [
    commonjs(),
    snaps(),
    execute(['yarn manifest', 'yarn eval']),
    resolve({ browser: true }, extensions),
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
  // external: ['@protobuf-ts/plugin', 'js-sha3', '@noble/ed25519'],
};

// 需要导出的模块类型
const outputMap = [
  {
    file: packageJSON.main,
    format: 'umd',
    // globals: {
    //   '@noble/ed25519': 'ed',
    //   'js-sha3': 'js-sha3',
    // },
    sourcemap: true,
    extend: true,
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

const buildConf = options => Object.assign({}, commonConf, options);

const webConfig = {
  input: './src/index.ts',
  output: {
    file: './dist/main.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [babel({ babelHelpers: 'bundled', extensions: ['.ts'] })],
};
export default outputMap.map(output =>
  buildConf({ output: { name: packageJSON.name, ...output } }),
);
