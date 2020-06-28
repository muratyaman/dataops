import { ILogger, MgConfig, MgDatabase  } from '../src';

test('MgDatabase', async () => {
  const config: MgConfig = {
    URL: 'mongodb://server1.example.com:27017',
    DB_NAME: 'testdb',
  };
  const logger: ILogger = {
    log:   async (msg: any) => { console.log(msg) },
    debug: async (msg: any) => { console.debug(msg) },
    info:  async (msg: any) => { console.info(msg) },
    warn:  async (msg: any) => { console.warn(msg) },
    error: async (msg: any) => { console.error(msg) },
  }
  const db = new MgDatabase(config, logger);
  expect(db instanceof MgDatabase);
});
