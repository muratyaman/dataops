import { ILogger, PgConfig, PgDatabase } from '../src';

test('PgDatabase', async () => {
  const config: PgConfig = {
    URL: 'postgresql://myuser:mypassword@server1.example.com:5432/mydb',
  };
  const logger: ILogger = {
    log:   async (msg: any) => { console.log(msg) },
    debug: async (msg: any) => { console.debug(msg) },
    info:  async (msg: any) => { console.info(msg) },
    warn:  async (msg: any) => { console.warn(msg) },
    error: async (msg: any) => { console.error(msg) },
  }
  const db = new PgDatabase(config, logger);
  expect(db instanceof PgDatabase);
});
