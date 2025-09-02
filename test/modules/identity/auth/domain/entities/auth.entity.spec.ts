import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthEntity } from '../../../../../../src/modules/identity/auth/domain/entities/auth.entity';
import { AuthProvider } from '../../../../../../src/modules/identity/auth/domain/entities/providers.enum';

describe('Auth Entity', () => {
  const now: Date = new Date();
  let auth: AuthEntity;

  beforeEach(() => {
    auth = new AuthEntity(
      'id123',
      'userId123',
      AuthProvider.LOCAL,
      false,
      now,
      now,
      'oscar@test.com',
      'passwordHashed',
      null,
      null,
      null,
    );
  });

  it('should create a user with valid data', () => {
    expect(auth.id).toBe('id123');
    expect(auth.userId).toBe('userId123');
    expect(auth.provider).toBe('local');
    expect(auth.isVerified).toBe(false);
    expect(auth.createdAt).toBe(now);
    expect(auth.updatedAt).toBe(now);
    expect(auth.email).toBe('oscar@test.com');
    expect(auth.password).toBe('passwordHashed');
    expect(auth.deletedAt).toBe(null);
    expect(auth.providerUserId).toBe(null);
    expect(auth.resetToken).toBe(null);
  });

  it('should throw an error if the user account is not yet verified', () => {
    expect(() => auth.ensureVerified()).toThrow(ForbiddenException);
  });

  it('should not throw an error if the user account is already verified', () => {
    auth.isVerified = true;

    expect(() => auth.ensureVerified()).not.toThrow();
  });

  it('should throw an error if the user provider is not local', () => {
    auth.provider = AuthProvider.GOOGLE;

    expect(() => auth.ensureValidProvider()).toThrow(BadRequestException);
  });

  it('should not throw an error if the user provider is local', () => {
    expect(() => auth.ensureValidProvider()).not.toThrow();
  });

  it('should throw an error if the email to register already exists', () => {
    expect(() => auth.existsEmailToRegister()).toThrow(ConflictException);
  });

  it('should not throw an error if the email to register does not exists by soft delete', () => {
    auth.deletedAt = now;
    expect(() => auth.existsEmailToRegister()).not.toThrow();
  });

  it('should not throw an error if the email to register does not exists', () => {
    auth.email = null;
    expect(() => auth.existsEmailToRegister()).not.toThrow();
  });
});
