import path from "path";
import { fileURLToPath } from "url";
import vue from "rollup-plugin-vue";
import alias from "@rollup/plugin-alias";
import buble from "@rollup/plugin-buble";
import postcss from "rollup-plugin-postcss";
import replace from "@rollup/plugin-replace";
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRootDir = path.resolve(__dirname);

// Web component build - bundles everything including Vue and Vuex
export default {
  input: "src/web-component.js",
  // Don't externalize Vue/Vuex - bundle them for web component
  external: [],
  output: {
    format: "iife",
    file: "dist/vue-timelines-wc.js",
    name: "VueTimelines",
    exports: "named",
    globals: {},
  },
  plugins: [
    alias({
      entries: [
        {
          find: "@",
          replacement: `${path.resolve(projectRootDir, "./src")}`,
        },
      ],
      customResolver: nodeResolve({
        extensions: [".js", ".jsx", ".vue"],
      }),
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify("production"),
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      preventAssignment: true,
    }),
    nodeResolve({
      dedupe: ["vue"],
      extensions: [".js", ".jsx", ".vue"],
    }),
    vue({
      css: true,
      compileTemplate: true,
      template: {
        isProduction: true,
      },
    }),
    commonjs(),
    postcss({}),
    buble({
      objectAssign: "Object.assign",
      transforms: {
        generator: false,
        forOf: false,
        asyncAwait: false,
        objectRestSpread: true,
        defaultParameter: true,
        destructuring: true
      },
      exclude: 'node_modules/**'
    }),
    terser({
      output: {
        ecma: 5
      }
    }),
  ],
};

