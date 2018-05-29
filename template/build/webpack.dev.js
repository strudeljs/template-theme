require('dotenv').config();
const ip = require('ip');
const AemSyncPlugin = require('aem-sync-webpack-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');

module.exports = {
  mode: 'development',
  plugins: [
    new AemSyncPlugin({
      targets: [
        process.env.AUTHOR_URL,
        process.env.PUBLISH_URL,
      ],
      watchDir: '.',
      exclude: [
        '**/node_modules/**',
        '**/src/sass/**',
        '**/src/js/**',
        '**/build/**',
      ],
      pushInterval: 1000,
    }),
    new LiveReloadPlugin({
      delay: 1400, // pass higher value in case of not refreshing JS or CSS
      appendScriptTag: true,
      hostname: ip.address(),
    }),
  ],
};
