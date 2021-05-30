/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import program from 'commander';
import express from 'express';
import path from 'path';
import http from 'http';
import https from 'https';
import fs from 'fs';

export async function start(port: number, dir: string, withHttps = false) {
  const app = express();
  app.use('/app', express.static(dir));
  app.use('/app', (_, res) => {
    res.sendFile(path.join(dir, 'index.html'));
  });
  const createOptions = () => {
    const certDir = path.join(__dirname, 'certs');
    return {
      key: fs.readFileSync(path.join(certDir, 'server.key.pem')),
      cert: fs.readFileSync(path.join(certDir, 'server.cert.pem')),
      ca: fs.readFileSync(path.join(certDir, 'intermediate-ca.cert.pem'))
    };
  };
  const httpServer = withHttps ? https.createServer(createOptions(), app) : http.createServer(app);
  await new Promise<void>(resolve => {
    httpServer.listen(port, () => {
      console.log(`WebServer running at http://localhost:${port}`);
      resolve();
    });
  });
  return async () => await new Promise<void>(resolve => httpServer.close(() => resolve()));
}

if (require.main === module) {
  program
    .arguments('<dir>')
    .option('-s, --https', 'use https (default: http')
    .description('Starts a web server serving files from the given directory')
    .action(async (dir: string, cmd) => {
      start(cmd.https ? 8443 : 8080, path.resolve(dir), cmd.https);
    });

  program.parse(process.argv);
}
