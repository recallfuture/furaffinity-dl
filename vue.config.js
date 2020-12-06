/* eslint-disable @typescript-eslint/camelcase */

module.exports = {
  productionSourceMap: false,
  transpileDependencies: ["vuetify"],

  configureWebpack: config => {
    config.entry.app = "./src/renderer/index.ts";
  },

  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      externals: ["typeorm", "better-sqlite3"],
      mainProcessFile: "src/main/index.ts",
      chainWebpackMainProcess: config => {
        config.resolve.extensions.add(".json");
        if (process.env.NODE_ENV === "production") {
          config.plugin("uglify").tap(option => {
            option[0].terserOptions = {
              keep_classnames: true,
              keep_fnames: true
            };
            return option;
          });
          config.optimization.minimize(false);
        }
      },
      builderOptions: {
        productName: "Furaffinity-dl",
        asar: true,
        files: [
          "**/*",
          "!**/node_modules/better-sqlite3/**/*",
          "**/node_modules/better-sqlite3/**/*.{node,lib,json,js}"
        ],
        win: {
          target: [
            // {
            //   target: "nsis",
            //   arch: ["x64"]
            // },
            {
              target: "zip",
              arch: ["x64"]
            }
          ],
          extraResources: {
            from: "./extra/win32/",
            to: "./",
            filter: ["**/*"]
          }
        }
      }
    }
  }
};
