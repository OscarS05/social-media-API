import { AuthEntity } from '../../../../../../src/modules/identity/auth/domain/entities/auth.entity';
import { AuthProvider } from '../../../../../../src/modules/identity/auth/domain/enums/providers.enum';
import {
  AccountNotVerifiedError,
  EmailAlreadyInUseError,
  InvalidEmailError,
  InvalidIdError,
  InvalidPasswordError,
  InvalidProviderError,
} from '../../../../../../src/modules/identity/auth/domain/errors/auth.errors';

describe('Auth Entity', () => {
  const now: Date = new Date();
  let auth: AuthEntity;
  const authId: string = '10346550-dfaa-4b2f-add6-21743b37db10';
  const userId: string = 'd883878e-16cf-47f4-87b3-670566abe41e';
  const provider = AuthProvider.LOCAL;
  const isVerified: boolean = true;
  const createdAt: Date = now;
  const updatedAt: Date = now;
  const email: string = 'email@test.com';
  const password: string = '$2b$10$NhWYk4wG.q2//UkuKEvqE.74C5fw/2Z9Xs0MOzmpCKv/P5d3UpYNu';

  beforeEach(() => {
    auth = new AuthEntity(
      authId,
      userId,
      provider,
      isVerified,
      createdAt,
      updatedAt,
      email,
      password,
      null,
      null,
      null,
    );
  });

  it('should contain the user data successfully', () => {
    auth.deletedAt = now;
    expect(auth.getId).toBe(authId);
    expect(auth.getUserId).toBe(userId);
    expect(auth.provider).toBe(provider);
    expect(auth.isVerified).toBe(isVerified);
    expect(auth.createdAt).toBe(now);
    expect(auth.updatedAt).toBe(now);
    expect(auth.getEmail).toBe(email);
    expect(auth.getPassword).toBe(password);
    expect(auth.deletedAt).toBe(now);
    expect(auth.providerUserId).toBe(null);
    expect(auth.resetToken).toBe(null);
  });

  it('should throw an error if the user account is not yet verified', () => {
    auth.isVerified = false;
    expect(() => auth.ensureVerified()).toThrow(AccountNotVerifiedError);
  });

  it('should not throw an error if the user account is already verified', () => {
    auth.isVerified = true;

    expect(() => auth.ensureVerified()).not.toThrow();
  });

  it('should throw an error if the user provider is not local', () => {
    auth.provider = AuthProvider.GOOGLE;

    expect(() => auth.ensureValidProvider()).toThrow(InvalidProviderError);
  });

  it('should not throw an error if the user provider is local', () => {
    expect(() => auth.ensureValidProvider()).not.toThrow();
  });

  it('should throw an error if the email to register already exists', () => {
    expect(() => auth.existsEmailToRegister()).toThrow(EmailAlreadyInUseError);
  });

  it('should not throw an error if the email to register does not exists by soft delete', () => {
    auth.deletedAt = now;
    expect(() => auth.existsEmailToRegister()).not.toThrow();
  });

  it('should throw an error if the authId is invalid', () => {
    expect(() => (auth.setId = 'test-uuid-123')).toThrow(InvalidIdError);
  });

  it('should throw an error if the userId is invalid', () => {
    expect(() => (auth.setUserId = 'test-uuid-123')).toThrow(InvalidIdError);
  });

  it('should throw an error if the email is invalid', () => {
    expect(() => (auth.setEmail = 'email@test')).toThrow(InvalidEmailError);
  });

  it('should throw an error if the password is invalid', () => {
    expect(() => (auth.setPlainPass = 'password')).toThrow(InvalidPasswordError);
  });
});
