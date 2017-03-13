'use strict';

const path = require('path');
const webpack = require('webpack');

const valLoader = require.resolve('../../lib/loader.js');
const helperLoader = require.resolve('./helperLoader.js');
const fixturePath = path.resolve(__dirname, '..', 'fixtures');
const outputPath = path.resolve(__dirname, '..', 'output');

function compile(fixture, loaderOptions, loaderContext) {
  return new Promise((resolve, reject) => {
    const entry = path.resolve(fixturePath, `${fixture}.js`);
    let inspect;

    webpack({
      entry,
      output: {
        path: outputPath,
        filename: 'bundle.js',
      },
      module: {
        rules: [{
          test: /\.js$/,
          loaders: [{
            loader: helperLoader,
            options: loaderContext,
          }, {
            loader: 'inspect-loader',
            options: {
              callback(i) {
                inspect = i;
              },
            },
          },
          {
            loader: valLoader,
            options: loaderOptions,
          }],
        }],
      },
    }, (err, stats) => {
      const problem = err || stats.compilation.errors[0] || stats.compilation.warnings[0];

      if (problem) {
        const message = typeof problem === 'string' ? problem : 'Unexpected error';
        const error = problem.message ? problem : new Error(message);

        error.originalError = err;
        error.stats = stats;

        reject(error);

        return;
      }

      resolve({
        inspect,
        stats,
      });
    });
  });
}

module.exports = compile;
