/* eslint-disable @typescript-eslint/no-var-requires */
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { resolve } = require("path");

module.exports = {
  productionSourceMap: false,

  configureWebpack: (config) => {
    config.entry.app = "./src/renderer/index.ts";
  },

  pluginOptions: {
    electronBuilder: {
      externals: ["typeorm"],
      mainProcessFile: "src/main/index.ts",
      chainWebpackMainProcess: (config) => {
        // 支持解析 json
        config.resolve.extensions.add(".json");
        // 防止因 typeorm 动态 require 导致大量无关文件打包进来
        config
          .plugin("webpack-ignore-dynamic-require")
          .use("webpack-ignore-dynamic-require");

        // 不转译 sql.js
        config.module.noParse(/sql\.js/);
        // 把 sql.js 所需的文件拷贝过来
        config.plugin("CopyWebpackPlugin").use(CopyWebpackPlugin, [
          {
            patterns: [
              {
                from: resolve(
                  __dirname,
                  "node_modules/sql.js/dist/sql-wasm.js"
                ),
                to: "sql-wasm.js",
              },
              {
                from: resolve(
                  __dirname,
                  "node_modules/sql.js/dist/sql-wasm.wasm"
                ),
                to: "sql-wasm.wasm",
              },
            ],
          },
        ]);

        if (process.env.NODE_ENV === "production") {
          config.plugin("uglify").tap((option) => {
            option[0].terserOptions = {
              keep_classnames: true,
              keep_fnames: true,
            };
            return option;
          });
          config.optimization.minimize(false);
        }
      },
      builderOptions: {
        productName: "Furaffinity-dl",
        asar: true,
        files: ["**/*"],
        win: {
          target: [
            // {
            //   target: "nsis",
            //   arch: ["x64"]
            // },
            {
              target: "zip",
              arch: ["x64"],
            },
          ],
          extraResources: {
            from: "./extra/win32/",
            to: "./",
            filter: ["**/*"],
          },
        },
      },
    },
  },
};
