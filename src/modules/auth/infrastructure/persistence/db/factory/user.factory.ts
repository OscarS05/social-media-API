import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';

import { User as UserORM } from '../entites/user.orm-entity';
import { Roles } from '../../../../domain/enums/roles.enum';
import { AuthProvider } from '../../../../domain/enums/providers.enum';
import { USER_ID } from '../../../../../../../test/factories/session.factory';
import { ID } from '../../../../../../../test/factories/user.factory';

export const userFactory = setSeederFactory(UserORM, () => {
  const user = new UserORM();
  const provider = faker.helpers.arrayElement(Object.values(AuthProvider) as AuthProvider[]);

  user.id = faker.string.uuid();
  user.name = faker.person.fullName();
  user.role = Roles.MEMBER;
  user.email = faker.internet.email();
  user.provider = provider;
  user.resetToken = null;
  user.deletedAt = null;
  user.createdAt = faker.date.past({ years: 1 });
  user.updatedAt = faker.date.recent({ days: 30 });

  if (provider === AuthProvider.LOCAL) {
    user.password = '$2a$12$KmH86KdEspqFFmTMG5ixnuEhYW1aBz8Pnsx70QoHqCzpUKkxrx6fC'; // "Password123!" hashed
    user.providerId = null;
    user.isVerified = faker.datatype.boolean();
  } else {
    user.password = null;
    user.providerId = faker.string.uuid();
    user.isVerified = true;
  }

  return user;
});

export const SEEDED_ADMIN = {
  id: USER_ID,
  name: 'Admin Test',
  email: 'admin@test.com',
  password: 'Password123!',
  passwordHashed: '$2a$12$KmH86KdEspqFFmTMG5ixnuEhYW1aBz8Pnsx70QoHqCzpUKkxrx6fC',
  role: Roles.ADMIN,
  provider: AuthProvider.LOCAL,
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

export const SEEDED_MEMBER = {
  id: ID,
  name: 'Member Test',
  email: 'member@test.com',
  password: 'Password123!',
  passwordHashed: '$2a$12$KmH86KdEspqFFmTMG5ixnuEhYW1aBz8Pnsx70QoHqCzpUKkxrx6fC',
  role: Roles.MEMBER,
  provider: AuthProvider.LOCAL,
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};
