export interface Env {
  MYSQL_HOST: string;
  MYSQL_PORT: number;
  MYSQL_NAME: string;
  MYSQL_USER: string;
  MYSQL_PASSWORD: string;
  ROUNDS_HASH_PASSWORD: number;
  ACCESS_SECRET: string;
  ACCESS_EXPIRES_IN: string;
  REFRESH_SECRET: string;
  REFRESH_EXPIRES_IN: string;
}
