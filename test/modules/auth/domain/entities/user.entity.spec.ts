import { AuthProvider } from '../../../../../src/modules/auth/domain/enums/providers.enum';
import { Roles } from '../../../../../src/modules/auth/domain/enums/roles.enum';
import { UserEntity } from '../../../../../src/modules/auth/domain/entities/user.entity';
import {
  AccountNotVerifiedError,
  InvalidEmailError,
  InvalidHashError,
  InvalidPasswordError,
  InvalidProviderError,
} from '../../../../../src/modules/auth/domain/errors/auth.errors';
import { InvalidNameError } from '../../../../../src/modules/auth/domain/errors/user.errors';

describe('UserEntity', () => {
  const id = 'd883878e-16cf-47f4-87b3-670566abe41e';
  const name = 'Nombre de usuario';
  const email = 'email@domain.com';
  const role = Roles.MEMBER;
  const plainPassword = 'Password1!';
  const hashedPassword = '$2b$10$NhWYk4wG.q2//UkuKEvqE.74C5fw/2Z9Xs0MOzmpCKv/P5d3UpYNu';
  const providerId = 'google-12345';
  const now = new Date();

  describe('create()', () => {
    it('should to construct a new user with valid data', () => {
      const user = UserEntity.create({
        id,
        name,
        email,
        provider: AuthProvider.LOCAL,
        password: plainPassword,
        isVerified: false,
      });

      expect(user.id).toBe(id);
      expect(user.name).toBe(name);
      expect(user.role).toBe(Roles.MEMBER);
      expect(user.provider).toBe(AuthProvider.LOCAL);
      expect(user.email).toBe(email);
      expect(user.password).toBe(plainPassword);
      expect(user.isVerified).toBe(false);
      expect(user.providerId).toBeNull();
      expect(user.resetToken).toBeNull();
      expect(user.deletedAt).toBeNull();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should to create a user without password when no password is provided', () => {
      const user = UserEntity.create({
        id,
        name,
        email,
        provider: AuthProvider.GOOGLE,
        providerId,
        isVerified: true,
      });

      expect(user.provider).toBe(AuthProvider.GOOGLE);
      expect(user.password).toBeNull();
      expect(user.providerId).toBe(providerId);
      expect(user.isVerified).toBe(true);
    });

    it('should throw InvalidEmailError when email is invalid', () => {
      expect(() =>
        UserEntity.create({
          id,
          name,
          email: 'invalid-email',
          provider: AuthProvider.LOCAL,
          password: plainPassword,
          isVerified: false,
        }),
      ).toThrow(InvalidEmailError);
    });

    it('should throw InvalidNameError when name is invalid', () => {
      expect(() =>
        UserEntity.create({
          id,
          name: 'x',
          email,
          provider: AuthProvider.LOCAL,
          password: plainPassword,
          isVerified: false,
        }),
      ).toThrow(InvalidNameError);
    });

    it('should throw InvalidPasswordError when password is invalid', () => {
      expect(() =>
        UserEntity.create({
          id,
          name,
          email,
          provider: AuthProvider.LOCAL,
          password: '123',
          isVerified: false,
        }),
      ).toThrow(InvalidPasswordError);
    });
  });

  describe('fromPersistence()', () => {
    it('should to rehidrate correctly an entity from the database', () => {
      const persisted = {
        id,
        name,
        role: Roles.MEMBER,
        provider: AuthProvider.LOCAL,
        isVerified: true,
        email,
        password: hashedPassword,
        providerId: null,
        resetToken: 'reset-token-123',
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };

      const user = UserEntity.fromPersistence(persisted);

      expect(user.id).toBe(id);
      expect(user.name).toBe(name);
      expect(user.role).toBe(Roles.MEMBER);
      expect(user.provider).toBe(AuthProvider.LOCAL);
      expect(user.isVerified).toBe(true);
      expect(user.email).toBe(email);
      expect(user.password).toBe(hashedPassword);
      expect(user.providerId).toBeNull();
      expect(user.resetToken).toBe('reset-token-123');
      expect(user.createdAt).toBe(now);
      expect(user.updatedAt).toBe(now);
      expect(user.deletedAt).toBeNull();
    });
  });

  describe('métodos de dominio', () => {
    let user: UserEntity;

    beforeEach(() => {
      user = UserEntity.create({
        id,
        name,
        email,
        provider: AuthProvider.LOCAL,
        password: plainPassword,
        isVerified: false,
      });
    });

    it('should to return the basic user data', () => {
      const basic = user.toBasic();

      expect(basic).toEqual({ id, name, email, role });
    });

    it('should to throw InvalidProviderError if the provider is not local', () => {
      user = UserEntity.create({
        id,
        name,
        email,
        provider: AuthProvider.GOOGLE,
        providerId,
        isVerified: true,
      });

      expect(() => user.validateLocalAuth()).toThrow(InvalidProviderError);
    });

    it('should to throw AccountNotVerifiedError when the user is not verified', () => {
      expect(() => user.ensureVerified()).toThrow(AccountNotVerifiedError);
    });

    it('should not throw when the user is verified', () => {
      user.verify();
      expect(user.isVerified).toBe(true);
      expect(() => user.ensureVerified()).not.toThrow();
    });

    it('should to update the email and the update date', () => {
      const previousUpdatedAt = user.updatedAt;
      const newEmail = 'nuevo@domain.com';

      user.changeEmail(newEmail);

      expect(user.email).toBe(newEmail);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
    });

    it('should to update the password with a valid hash', () => {
      const previousUpdatedAt = user.updatedAt;
      const newHashedPassword = hashedPassword;

      user.changePassword(newHashedPassword);

      expect(user.password).toBe(newHashedPassword);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(previousUpdatedAt.getTime());
    });

    it('should to throw InvalidHashError if the new password is not a valid bcrypt hash', () => {
      expect(() => user.changePassword('invalido')).toThrow(InvalidHashError);
    });
  });
});
