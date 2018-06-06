const config = {
  mode: 'development',
  target: 'node',
  entry: {
    'messages': ['babel-polyfill', './messages/index.js']
  },
  output: {
    path: __dirname,
    filename: '[name]/handler.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
}

export default [config]
