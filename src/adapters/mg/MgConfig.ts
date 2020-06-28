import { IConfig } from '../../dataops';

export interface MgConfig extends IConfig {

  /**
   * @example 'mongodb://server1.example.com:27017'
   */
  URL: string;

  DB_NAME: string;
}
