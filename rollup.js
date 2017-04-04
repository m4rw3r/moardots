const { rollup }   = require("rollup");
const babel        = require("rollup-plugin-babel");
const uglify       = require("rollup-plugin-uglify");
const replace      = require("rollup-plugin-replace");
const strip        = require("rollup-plugin-strip");
const gzip         = require("rollup-plugin-gzip");
const localResolve = require("rollup-plugin-local-resolve");
// We use a different version of uglifyjs2 which supports most of es2015 syntax
const minify       = require("uglifyjs").minify;

const targets = {
  "":       { format: "cjs", sourceMap: true },
  "es2015": { format: "es",  sourceMap: true },
  "umd":    { format: "umd", sourceMap: true, moduleName: "moardots" }
};

const shared = {
  entry: "src/index.js",
  plugins: [
    localResolve(),
    babel({
      babelrc: false,
      presets: ["es2015-rollup"],
      plugins: ["syntax-flow", "syntax-jsx", "transform-flow-strip-types"]
    }),
  ]
};

const dev = shared;

const prod = Object.assign({}, shared, {
  plugins: shared.plugins.concat([
    strip(),
    replace({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    uglify({
      warnings: true,
      compress: {
        sequences:     true,
        properties:    true,
        dead_code:     true,
        unsafe:        true,
        conditionals:  true,
        evaluate:      true,
        booleans:      true,
        loops:         true,
        unused:        true,
        hoist_funs:    true,
        if_return:     true,
        join_vars:     true,
        cascade:       true,
        collapse_vars: true,
        reduce_vars:   true,
        pure_getters:  true,
        warnings:      true,
        negate_iife:   true,
        pure_funcs:    [],
        keep_fargs:    true,
        keep_fnames:   false,
        passes:        3
      },
      mangle:   {
        toplevel: true,
        except:   [],
      },
      mangleProperties: {
        regex: /^_/
      },
      output: {
        beautify: false
      }
    }, minify),
    gzip({
      options: {
        level: 9
      }
    })
  ])
});

rollup(dev).then(bundle =>
  Object.keys(targets).map(suffix =>
    bundle.write(Object.assign({}, targets[suffix], { dest: "dist/index" + (suffix ? "." + suffix : "") + ".js" }))));

rollup(prod).then(bundle =>
  Object.keys(targets).map(suffix =>
    bundle.write(Object.assign({}, targets[suffix], { dest: "dist/index.min" + (suffix ? "." + suffix : "") + ".js" }))));
