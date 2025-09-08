export interface Env {
  // App
  PORT: number;
  URL_CLIENT: string;

  // DB
  MYSQL_HOST: string;
  MYSQL_PORT: number;
  MYSQL_NAME: string;
  MYSQL_USER: string;
  MYSQL_PASSWORD: string;

  // HASHES
  ROUNDS_HASH_PASSWORD: number;

  // JWT
  ACCESS_SECRET: string;
  ACCESS_EXPIRES_IN: string;
  REFRESH_SECRET: string;
  REFRESH_EXPIRES_IN: string;

  // Google OAuth2.0
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;

  // Facebook OAuth2.0
  FACEBOOK_CLIENT_ID: string;
  FACEBOOK_CLIENT_SECRET: string;
}
