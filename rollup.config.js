import path from "path";
import vue from "rollup-plugin-vue";
import alias from "@rollup/plugin-alias";
import buble from "@rollup/plugin-buble";
import postcss from "rollup-plugin-postcss";
import replace from "@rollup/plugin-replace";
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "@rollup/plugin-terser";

const projectRootDir = path.resolve(__dirname);

// Get format from command line or default to all
const format = process.env.BUILD_FORMAT || 'all';

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
      transforms: {  generator: false, forOf: false, asyncAwait: false  },
    }),
  ],
};

const outputs = {
  umd: {
    format: "umd",
    file: "dist/vue-timelines.umd.js",
    name: "MyTimeline",
    exports: "named",
    globals: {
      vue: "Vue",
      dayjs: "dayjs",
      vue3slider: "vue3-slider",
    },
  },
  es: {
    format: "es",
    file: "dist/vue-timelines.esm.js",
    exports: "named",
    globals: {
      vue: "Vue",
      dayjs: "dayjs",
      vue3slider: "vue3-slider",
    },
  },
  iife: {
    format: "iife",
    file: "dist/vue-timelines.min.js",
    name: "MyTimeline",
    exports: "named",
    globals: {
      vue: "Vue",
      dayjs: "dayjs",
      vue3slider: "vue3-slider",
    },
  },
};

// Add terser only for iife/minified builds
if (format === 'iife') {
  baseConfig.plugins.push(terser({ output: { ecma: 5 } }));
}

if (format === 'all') {
  baseConfig.output = [outputs.umd, outputs.es, outputs.iife];
} else if (outputs[format]) {
  baseConfig.output = outputs[format];
} else {
  baseConfig.output = [outputs.umd, outputs.es, outputs.iife];
}

export default baseConfig;
