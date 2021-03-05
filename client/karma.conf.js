/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'webpack'],
    files: [{ pattern: 'src/**/*.spec.ts', watched: false }],
    preprocessors: { 'src/**/*.spec.ts': ['webpack'] },
    reporters: ['coverage-istanbul', 'kjhtml'],
    coverageIstanbulReporter: {
      reports: ['html', 'text-summary'],
      fixWebpackSourcePaths: true
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    concurrency: Infinity,
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: { extensions: ['.ts', '.js'] },
      module: {
        rules: [
          { test: /\.ts$/, use: { loader: 'ts-loader', options: { transpileOnly: true } } },
          {
            test: /\.ts$/,
            exclude: /node_modules|\.spec\.ts$/,
            use: ['@jsdevtools/coverage-istanbul-loader', 'ts-loader']
          },
          {
            test: /\.scss$/,
            use: [
              'style-loader',
              { loader: 'css-loader', options: { sourceMap: true } },
              { loader: 'sass-loader', options: { sourceMap: true } }
            ]
          }
        ]
      }
    }
  });
};
