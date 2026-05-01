import { UserEntity } from '../../src/modules/auth/domain/entities/user.entity';
import { AuthProvider } from '../../src/modules/auth/domain/enums/providers.enum';
import { Roles } from '../../src/modules/auth/domain/enums/roles.enum';
import { UserRawData } from '../../src/modules/auth/domain/types/user';

export const buildUserEntity = (overrides?: Partial<UserRawData>): UserEntity => {
  return UserEntity.fromPersistence({
    id: ADMIN_ID,
    name: NAME,
    email: EMAIL,
    password: PASSWORD_HASHED,
    role: Roles.MEMBER,
    provider: AuthProvider.LOCAL,
    providerId: null,
    isVerified: true,
    resetToken: null,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  });
};

export const ADMIN_ID = '68c07572-ff80-4326-8aff-3d109fbd5bcb';
export const MEMBER_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';
export const NAME = 'oscar s';
export const EMAIL = 'oscar@example.com';
export const NEW_EMAIL = 'new.email@example.com';
export const PASSWORD_HASHED = '$2b$10$Gmf2rRTDFHivOSabipenYOX1qg9bM5zDGuFdEnovjTr8LfRJ1ylK6';
export const NEW_PASSWORD_HASHED =
  '$2b$10$ba0RJXwjvkNgPV534GlgB.jHfIG5oa6UoJx3tKvYrNc5KJ/gc64PO';
export const PASSWORD_PLAIN = 'Password123!';
export const PROVIDER_ID = 'google-oauth2|123456789';
export const RESET_TOKEN = 'reset-token-abc123';
export const EMAIL_OAUTH_GOOGLE = 'google-oauth@test.com';

export const SEEDED_ADMIN = {
  id: ADMIN_ID,
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
  id: MEMBER_ID,
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
