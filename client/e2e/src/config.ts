/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

const configFile = require('./config.json');

class Config {
  launchOptions = { headless: configFile.headless, slowMo: configFile.slowMo };

  clientPort = Number(new URL(configFile.client).port);

  serverPort = Number(new URL(configFile.server).port);

  clientUrl(relUrl: string) {
    return this.url(configFile.client, relUrl);
  }

  serverUrl(relUrl: string) {
    return this.url(configFile.server, relUrl);
  }

  private url(baseUrl: string, relUrl: string) {
    return `${baseUrl}${relUrl.startsWith('/') ? '' : '/'}${relUrl}`;
  }
}

export default new Config();
