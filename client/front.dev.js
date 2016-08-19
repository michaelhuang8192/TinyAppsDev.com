
module.exports = {
  entry: './src/index.js',

  output: {
    filename: 'dist/bundle.js',
    publicPath: ''
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader?presets[]=es2015&presets[]=react' }
    ]
  },

  devServer: {
    historyApiFallback: true,
    proxy: {
      '/api/*': {
        target: 'http://localhost:3000'
        //rewrite: function(req) {
        // req.url = req.url.replace(/^\/api/, '');
        //}
      }
    }
  }

}
