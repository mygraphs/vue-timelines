import path from "path";
import { fileURLToPath } from "url";
import vue from "rollup-plugin-vue";
import alias from "@rollup/plugin-alias";
import postcss from "rollup-plugin-postcss";
import replace from "@rollup/plugin-replace";
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRootDir = path.resolve(__dirname);

// Get format from command line or default to all
const format = process.env.BUILD_FORMAT || 'all';
const isDebug = process.env.DEBUG === 'true';
const nodeEnv = isDebug ? 'development' : 'production';

const baseConfig = {
  input: "src/index.js",
  external: ["vue", "dayjs", "@vuepic/vue-datepicker"],
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
      dedupe: ["vue"],
      extensions: [".js", ".jsx", ".vue"],
    }),
    vue({
      css: true,
      compileTemplate: true,
      template: {
        isProduction: !isDebug,
      },
    }),
    commonjs(),
    postcss({}),
  ],
};

const outputs = {
  umd: {
    format: "umd",
    file: "dist/vue-timelines.umd.js",
    name: "MyTimeline",
    exports: "named",
    sourcemap: isDebug,
    generatedCode: {
      constBindings: true,
      objectShorthand: true,
    },
    globals: {
      vue: "Vue",
      dayjs: "dayjs",
      vue3slider: "vue3-slider",
      "@vuepic/vue-datepicker": "VueDatePicker",
    },
  },
  es: {
    format: "es",
    file: "dist/vue-timelines.esm.js",
    exports: "named",
    sourcemap: isDebug,
    generatedCode: {
      constBindings: true,
      objectShorthand: true,
    },
    globals: {
      vue: "Vue",
      dayjs: "dayjs",
      vue3slider: "vue3-slider",
      "@vuepic/vue-datepicker": "VueDatePicker",
    },
  },
  iife: {
    format: "iife",
    file: isDebug ? "dist/vue-timelines.debug.js" : "dist/vue-timelines.min.js",
    name: "MyTimeline",
    exports: "named",
    sourcemap: isDebug,
    generatedCode: {
      constBindings: true,
      objectShorthand: true,
    },
    globals: {
      vue: "Vue",
      dayjs: "dayjs",
      vue3slider: "vue3-slider",
      "@vuepic/vue-datepicker": "VueDatePicker",
    },
  },
};

// Add terser only for iife/minified builds in production mode
// Use modern ECMAScript (2020) instead of ES5
if (format === 'iife' && !isDebug) {
  baseConfig.plugins.push(terser({
    format: {
      comments: false,
      ecma: 2020,
    },
    safari10: true, // Fix Safari 10/11 await in loop bugs
  }));
}

if (format === 'all') {
  baseConfig.output = [outputs.umd, outputs.es, outputs.iife];
} else if (outputs[format]) {
  baseConfig.output = outputs[format];
} else {
  baseConfig.output = [outputs.umd, outputs.es, outputs.iife];
}

export default baseConfig;
