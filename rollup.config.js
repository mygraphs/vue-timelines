import path from "path";
import vue from "rollup-plugin-vue";
import alias from "@rollup/plugin-alias";
import buble from "@rollup/plugin-buble";
import postcss from "rollup-plugin-postcss";
import replace from "@rollup/plugin-replace";
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const projectRootDir = path.resolve(__dirname);

export default {
  input: "src/index.js",
  external: ["vue", "dayjs", "@vuepic/vue-datepicker"],
  output: {
    name: "MyTimeline",
    exports: "named",
    globals: {
      vue: "Vue",
      dayjs: "dayjs",
      vue3slider: "vue3-slider",
    },
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
      transforms: {  generator: false, forOf: false, asyncAwait: false  },
    }),
    terser({ output: { ecma: 5 } }),
  ],
};
