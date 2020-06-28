import { IConfig } from '../../dataops';

export interface PgConfig extends IConfig {

  /**
   * @example 'postgresql://myuser:mypassword@server1.example.com:5432/mydb'
   */
  URL: string;

}
