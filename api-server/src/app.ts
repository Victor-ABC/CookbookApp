/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import program from 'commander';
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import  Users  from './routes/users';
import  Message  from './routes/messages';
// TODO: Routen importieren

import startDB from './db';
import { corsService } from './services/cors.service';

function configureApp(app: Express) {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(corsService.expressMiddleware);
  // TODO: Routen einbinden
  app.use("/api/users", Users);
}

export async function start(port: number, dbms = 'in-memory-db', withHttps = false) {
  const app = express();

  configureApp(app);
  const stopDB = await startDB(app, dbms);
  const stopHttpServer = await startHttpServer(app, port, withHttps);

  return async () => {
    await stopHttpServer();
    await stopDB();
  };
}

async function startHttpServer(app: Express, port: number, withHttps: boolean) {
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
      console.log(`Server running at http://localhost:${port}`);
      resolve();
    });
  });
  return async () => await new Promise<void>(resolve => httpServer.close(() => resolve()));
}

if (require.main === module) {
  program
    .option('-d, --dbms <mongodb|psql|in-memory-db>', 'dbms to use (default: "in-memory-db")')
    .option('-s, --https', 'use https (default: http')
    .description('Starts the API server')
    .action(async cmd => {
      start(cmd.https ? 3443 : 3000, cmd.dbms, cmd.https);
    });

  program.parse(process.argv);
}
