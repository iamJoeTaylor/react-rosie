import buble from 'rollup-plugin-buble';

export default {
  entry: 'test/index.js',
  plugins: [
    buble({ exclude: 'node_modules/**' })
  ],
  format: 'cjs',
  intro: 'require("source-map-support").install();',
  dest: 'build/test-bundle.js',
  sourceMap: true
};
