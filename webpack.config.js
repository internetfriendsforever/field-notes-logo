const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    fieldNotesLogo: './src/index.js'
  },

  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',

  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js',
    library: '[name]'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },

      {
        test: /\.m4a$/,
        exclude: /node_modules/,
        use: 'arraybuffer-loader'
      },

      {
        test: /\.svg$/,
        exclude: /node_modules/,
        use: 'raw-loader'
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      template: path.join(__dirname, 'src', 'index.html')
    })
  ]
}
