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
import postcssScopePlugin from "./postcss-scope-plugin.js";

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
    // Add intro/outro for debugging
    intro: 'console.log("[vue-timelines] Bundle starting to execute...");',
    outro: 'console.log("[vue-timelines] Bundle execution complete");',
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
      dedupe: ["vue", "dayjs"],
      extensions: [".js", ".jsx", ".vue"],
      preferBuiltins: false,
      browser: true,
    }),
    vue({
      css: true, // Extract CSS from Vue components
      compileTemplate: true,
      template: {
        isProduction: true,
      },
      // Ensure styles are included in the bundle
      style: {
        inject: true, // Inject styles into the page
      },
    }),
    commonjs({
      include: ['node_modules/**'],
      requireReturnsDefault: 'auto',
      // Ensure dayjs and its plugins are properly handled
      transformMixedEsModules: true,
    }),
    postcss({
      // Inject CSS into the page when bundle loads
      inject: true, // This will inject CSS as <style> tags
      extract: false, // Don't extract to separate file
      minimize: false, // Don't minimize for debugging
      plugins: [
        // Scope all CSS to .vue-timeline-container to prevent style leakage
        postcssScopePlugin({
          containerSelector: '.vue-timeline-container'
        })
      ]
    }),
    buble({
      objectAssign: "Object.assign",
      transforms: {
        generator: false,
        forOf: false,
        asyncAwait: false,
        objectRestSpread: true,
        defaultParameter: true,
        destructuring: true,
        classes: false  // Don't transform classes - let them through as-is
      },
      exclude: ['node_modules/**', 'src/services/**']  // Exclude services from buble (uses ES6 classes)
    }),
    terser({
      output: {
        ecma: 5
      }
    }),
  ],
};

