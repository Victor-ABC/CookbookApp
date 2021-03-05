/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import Jasmine from 'jasmine';
import path from 'path';
import { start as startServer } from '../src/app';
import config from './src/config';

const jasmine = new Jasmine({});

async function start() {
  const stop = await startServer(config.port);

  jasmine.loadConfigFile(path.join(__dirname, 'jasmine.json'));
  jasmine.execute();
  jasmine.onComplete(async passed => {
    await stop();
    process.exit(passed ? 0 : 1);
  });
}

start();
