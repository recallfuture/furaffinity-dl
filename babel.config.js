module.exports = {
  plugins: [
    "@babel/plugin-proposal-nullish-coalescing-operator",
    [
      "component",
      {
        libraryName: "element-ui",
        styleLibraryName: "theme-chalk"
      }
    ]
  ],
  presets: ["@vue/cli-plugin-babel/preset"]
};
