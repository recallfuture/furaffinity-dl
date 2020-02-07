module.exports = {
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
          console.log(config);
        }
      },
      builderOptions: {
        productName: "Furaffinity-dl",
        appId: "space.recallsufuture.furaffinity-dl",
        asar: true,
        publish: [
          {
            provider: "github",
            owner: "recallfuture",
            repo: "furaffinity-dl",
            releaseType: "draft"
          }
        ],
        dmg: {
          contents: [
            {
              x: 410,
              y: 150,
              type: "link",
              path: "/Applications"
            },
            {
              x: 130,
              y: 150,
              type: "file"
            }
          ]
        },
        mac: {
          target: ["dmg", "zip"],
          type: "distribution",
          extraResources: {
            from: "./extra/darwin/",
            to: "./",
            filter: ["**/*"]
          },
          binaries: [
            "./release/mac/Furaffinity-dl.app/Contents/Resources/engine/aria2c"
          ],
          category: "public.app-category.utilities"
        },
        win: {
          target: [
            {
              target: "nsis",
              arch: ["x64", "ia32"]
            },
            {
              target: "zip",
              arch: ["x64", "ia32"]
            },
            {
              target: "portable",
              arch: ["x64", "ia32"]
            }
          ],
          extraResources: {
            from: "./extra/win32/",
            to: "./",
            filter: ["**/*"]
          }
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true
        },
        linux: {
          category: "Network",
          target: ["deb", "snap", "AppImage"],
          extraResources: {
            from: "./extra/linux/",
            to: "./",
            filter: ["**/*"]
          }
        }
      }
    }
  }
};
