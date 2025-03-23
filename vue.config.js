const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    devServer: {
      hot: false, // 禁用热重载
      proxy: {
        '/bing': {
          target: 'https://cn.bing.com',
          changeOrigin: true,
          pathRewrite: {
            '^/bing': ''
          }
        }
      }
    },
  },
});
