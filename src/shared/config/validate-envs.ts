import * as Joi from 'joi';

export const validationSchema = Joi.object({
  MYSQL_HOST: Joi.string().required(),
  MYSQL_PORT: Joi.number().default(3306),
  MYSQL_USER: Joi.string().required(),
  MYSQL_PASSWORD: Joi.string().required(),
  MYSQL_NAME: Joi.string().required(),
});
