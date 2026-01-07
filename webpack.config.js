const path = require('path');

const baseConfig = {
  entry: './src/index.mjs',
  output: {
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'OptimalSelect',
      type: 'umd',
      export: 'default'
    },
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.mjs', '.js']
  }
};

module.exports = [
  {
    ...baseConfig,
    mode: 'development',
    devtool: false,
    output: {
      ...baseConfig.output,
      filename: 'optimal-select.js'
    }
  },
  {
    ...baseConfig,
    mode: 'production',
    devtool: 'source-map',
    output: {
      ...baseConfig.output,
      filename: 'optimal-select.min.js'
    }
  }
];
