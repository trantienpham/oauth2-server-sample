const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPkgJsonPlugin = require("copy-pkg-json-webpack-plugin");

module.exports = {
  target: "node",
  entry: {
    app: ["./index.js"]
  },
  output: {
    path: path.resolve(__dirname, "build/"),
    publicPath: "/",
    filename: '[name].js'
  },
  node: {
    // Need this when working with express, otherwise the build fails
    __dirname: false,   // if you don't put this is, __dirname
    __filename: false,  // and __filename return blank or /
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        // Transpiles ES6-8 into ES5
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  plugins: [
    new CopyPkgJsonPlugin({
      remove: ['devDependencies', 'pre-commit', 'scripts', 'husky'],
      replace: {scripts: {start: 'node app.js'}}
    })
  ],
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    alias: {
      app: path.resolve(__dirname, './app/'),
      lib: path.resolve(__dirname, './app/lib/'),
      config: path.resolve(__dirname, './app/config/'),
      model: path.resolve(__dirname, './app/model/'),
    }
  }
}