/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

const configFile = require('./config.json');

class Config {
  port = Number(new URL(configFile.server).port);

  url(relUrl: string) {
    return `${configFile.server}${relUrl.startsWith('/') ? '' : '/'}${relUrl}`;
  }
}

export default new Config();
