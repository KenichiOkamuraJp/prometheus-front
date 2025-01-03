const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  chainWebpack: (config) => {
    config.plugin('define').tap((definitions) => {
      Object.assign(definitions, {
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false' // または 'true'
      });
      return definitions;
    });
  },
  transpileDependencies: true
});
