const path = require('path');
const webpack = require('webpack');
const WebpackDi = require('webpack-dependency-injector');

const webpackDiPlugin = new WebpackDi({
  source: path.resolve(process.cwd(), 'src/web'),
  map: {
    rpc: path.resolve(process.cwd(), 'src/web/src/rpc.ts'),
  },
});

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    options: {
      presets: [['react-app', { flow: false, typescript: true }]],
    },
  });
  config.module.rules.push({
    test: /\.less$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
      },
      {
        loader: 'less-loader',
      },
    ],
  });
  config.module.rules.push({
    test: /\.css$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
      }
    ],
  });
  config.resolve.alias = {
    components: path.resolve(process.cwd(), 'src/web/src/components'),
    assets: path.resolve(process.cwd(), 'src/web/assets'),
    actions: path.resolve(process.cwd(), 'src/web/src/actions'),
    api: path.resolve(process.cwd(), 'src/web/src/api'),
  };
  config.resolve.extensions.push('.ts', '.tsx');
  config.plugins.push(webpackDiPlugin);
  config.plugins.push(
    new webpack.DefinePlugin({
      mp: require('../src/web/src/mp.ts'),
    })
  );
  // config.plugins.push(
  //   new ExtractTextPlugin({
  //     filename: 'styles.css',
  //     disable: false,
  //     allChunks: true,
  //   })
  // );
  return config;
};
