import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';

import { User as UserORM } from '../../../modules/auth/infrastructure/persistence/db/entites/user.orm-entity';
import { Roles } from '../../../modules/auth/domain/enums/roles.enum';
import { AuthProvider } from '../../../modules/auth/domain/enums/providers.enum';

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
  id: '70a35f48-3335-454a-833f-4b359e3c658a',
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
  id: 'b1c2d3e4-f5a6-4890-bcde-f12345678901',
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
