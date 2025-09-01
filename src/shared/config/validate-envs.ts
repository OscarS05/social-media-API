import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // DB
  MYSQL_HOST: Joi.string().required(),
  MYSQL_PORT: Joi.number().default(3306),
  MYSQL_USER: Joi.string().required(),
  MYSQL_PASSWORD: Joi.string().required(),
  MYSQL_NAME: Joi.string().required(),

  // HASH
  ROUNDS_HASH_PASSWORD: Joi.number().required(),

  // JWT
  ACCESS_SECRET: Joi.string().required(),
  ACCESS_EXPIRES_IN: Joi.string().required(),
  REFRESH_SECRET: Joi.string().required(),
  REFRESH_EXPIRES_IN: Joi.string().required(),
});
