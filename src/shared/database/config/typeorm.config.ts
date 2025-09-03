import { DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { SeederOptions } from 'typeorm-extension';

config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

export const typeOrmConfig: DataSourceOptions & SeederOptions = {
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_NAME,
  entities: [__dirname + '/../../../**/*.orm-entity.{ts,js}'],
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
  synchronize: false,

  seeds: [__dirname + '/../seeders/app.seeder.{ts,js}'],
  factories: [__dirname + '/../factories/*.{ts,js}'],
};
