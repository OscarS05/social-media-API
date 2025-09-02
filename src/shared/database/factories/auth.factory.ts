import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';

import { Auth } from '../../../modules/identity/auth/infrastructure/persistence/db/entites/auth.orm-entity';
import { AuthProvider } from 'src/modules/identity/auth/domain/entities/providers.enum';

const providers = [AuthProvider.FACEBOOK, AuthProvider.LOCAL];

export default setSeederFactory(Auth, () => {
  const auth = new Auth();
  auth.id = faker.string.uuid();
  // auth.email = faker.internet.email();
  auth.password = faker.internet.password();
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
});
