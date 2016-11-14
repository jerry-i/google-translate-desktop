/* eslint-disable no-console */
/**
 * Setup and run the development server for Hot-Module-Replacement
 * https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
 * @flow
 */
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import { spawn } from 'child_process';
import { hasProcessFlag } from './config/helpers';


const argv = require('minimist')(process.argv.slice(2));
const config = require('./config/webpack.dev')({env: 'development'});
const app = express();
const compiler = webpack(config);
const PORT = process.env.PORT || 3000;
const ENV = 'development';

const wdm = webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  stats: {
    colors: true
  }
});

app.use(wdm);

app.use(webpackHotMiddleware(compiler));
const server = app.listen(PORT, 'localhost', serverError => {
  if (serverError) return console.error(serverError);
  if (hasProcessFlag('start-hot')) {
    spawn('npm', ['run', 'start-hot'], {shell: true, env: process.env, stdio: 'inherit'})
      .on('close', code => process.exit(code))
      .on('error', spawnError => console.error(spawnError));
  }
  console.log(`Listening at http://localhost:${PORT}`);
  process.on('SIGTERM', () => {
    console.log('Stop dev server');
    wdm.close();
    server.close(() => {
      process.exit(0);
    });
  });
});

