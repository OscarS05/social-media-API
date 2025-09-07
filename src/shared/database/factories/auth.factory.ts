import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

import { Auth } from '../../../modules/identity/auth/infrastructure/persistence/db/entites/auth.orm-entity';
import { AuthProvider } from '../../../modules/identity/auth/domain/enums/providers.enum';

const providers = [AuthProvider.FACEBOOK, AuthProvider.LOCAL];
const rounds = parseInt(process.env.ROUNDS_HASH_PASSWORD ?? '10', 10);

export const authFactoryData = (userId?: string | null) => {
  const auth = new Auth();
  auth.id = faker.string.uuid();
  auth.userId = userId || faker.string.uuid();
  auth.email = faker.internet.email();
  auth.password = bcrypt.hashSync('password', rounds);
  auth.isVerified = faker.datatype.boolean();
  auth.provider = faker.helpers.arrayElement(providers);
  auth.providerUserId =
    auth.provider === AuthProvider.LOCAL
      ? null
      : faker.number.int({ max: 1000 }).toString();
  auth.createdAt = faker.date.past({ years: 1 });
  auth.updatedAt = faker.date.recent({ days: 30 });
  auth.deletedAt =
    Math.random() < 0.7
      ? null
      : faker.date.between({ from: auth.createdAt, to: new Date() });

  return auth;
};

export const authFactory = setSeederFactory(Auth, () => {
  return authFactoryData();
});
