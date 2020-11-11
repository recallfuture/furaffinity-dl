module.exports = {
  productionSourceMap: false,

  configureWebpack: config => {
    config.entry.app = "./src/renderer/index.ts";
  },

  pluginOptions: {
    electronBuilder: {
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
        win: {
          target: [
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
