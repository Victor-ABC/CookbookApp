/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import Jasmine from 'jasmine';
import path from 'path';
import config from './src/config';
import { start as startApiServer } from '../../api-server/src/app';
import { start as startWebServer } from '../../web-server/src/app';

const jasmine = new Jasmine({});

async function start() {
  const [stopApiServer, stopWebServer] = await Promise.all([
    startApiServer(config.serverPort),
    startWebServer(config.clientPort, path.join(__dirname, '..', 'dist'))
  ]);

  jasmine.loadConfigFile(path.join(__dirname, 'jasmine.json'));
  jasmine.execute();

  jasmine.onComplete(async passed => {
    await Promise.all([stopWebServer(), stopApiServer()]);
    process.exit(passed ? 0 : 1);
  });
}

start();
