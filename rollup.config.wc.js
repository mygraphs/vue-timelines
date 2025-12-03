import path from "path";
import { fileURLToPath } from "url";
import vue from "rollup-plugin-vue";
import alias from "@rollup/plugin-alias";
import postcss from "rollup-plugin-postcss";
import replace from "@rollup/plugin-replace";
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import postcssScopePlugin from "./postcss-scope-plugin.js";
import postcssImport from "postcss-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRootDir = path.resolve(__dirname);

const isDebug = process.env.DEBUG === 'true';
const nodeEnv = isDebug ? 'development' : 'production';

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
    sourcemap: isDebug,
    globals: {},
    // Use modern JavaScript features
    generatedCode: {
      constBindings: true,
      objectShorthand: true,
    },
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
      "process.env.NODE_ENV": JSON.stringify(nodeEnv),
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(isDebug),
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
        isProduction: !isDebug,
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
      minimize: !isDebug, // Minimize only in production
      plugins: [
        // IMPORTANT: postcss-import must be first to resolve all @import statements
        // This ensures all CSS is inlined and no external requests are made
        postcssImport(),
        // Scope all CSS to .vue-timeline-container to prevent style leakage
        postcssScopePlugin({
          containerSelector: '.vue-timeline-container'
        })
      ]
    }),
    // Only add terser in production mode (preserve all symbols in debug)
    // Use modern ECMAScript (2020) instead of ES5
    ...(isDebug ? [] : [terser({
      format: {
        comments: false,
        ecma: 2020,
      },
      safari10: true, // Fix Safari 10/11 await in loop bugs
    })]),
  ],
};

