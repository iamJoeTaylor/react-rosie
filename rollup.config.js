import buble from 'rollup-plugin-buble';
import nodeResolve from 'rollup-plugin-node-resolve';

var external = process.env.DEPS ? null : [ 'rosie' ];
var format = process.env.DEPS ? 'umd' : process.env.ES ? 'es6' : 'cjs';

export default {
  entry: 'src/index.js',
  dest: 'dist/react-rosie.' + format + '.js',
  format: format,
  plugins: [
    buble({ exclude: 'node_modules/**' }),
    nodeResolve({ jsnext: true, skip: external })
  ],
  moduleName: 'ReactRosie',
  external: external,
  sourceMap: true
};
