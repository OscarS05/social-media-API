import { LoginUseCase } from '../../../../../../../src/modules/identity/auth/application/use-cases/auth/Login.usecase';
import { IAuthRepositoryMock } from '../../../infrastructure/adapters/repositories/auth.repository';
import { IHasherServiceMock } from '../../../infrastructure/adapters/services/hasher.service';
import { UnauthorizedException } from '@nestjs/common';
import { authModule } from '../../../auth.module-mock';

describe('LoginUseCase', () => {
  let usecase: LoginUseCase;
  let authRepository: IAuthRepositoryMock;
  let hasherServiceMock: IHasherServiceMock;

  const name = 'test';
  const email = 'test@email.com';
  const role = 'member';
  const userId = '123';
  const password = 'password';
  const passHashed = 'pass-hashed';
  const authId = 'uuid-123';

  beforeAll(async () => {
    const module = await authModule;

    usecase = module.get<LoginUseCase>(LoginUseCase);
    authRepository = module.get('IAuthRepository');
    hasherServiceMock = module.get('IHasherService');
  });

  beforeEach(() => {
    authRepository.findByEmail.mockResolvedValue({
      id: authId,
      userId,
      email,
      password: passHashed,
      provider: 'local',
      isVerified: true,
      ensureValidProvider: () => true,
      ensureVerified: () => true,
      user: { id: userId, name, role },
      getPassword: passHashed,
      getEmail: email,
    });
    hasherServiceMock.compare.mockResolvedValue(true);
  });

  it('should return a user entity successfully', async () => {
    const result = await usecase.execute(email, password);

    expect(authRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(hasherServiceMock.compare).toHaveBeenCalledWith(password, passHashed);
    expect(result).toEqual(
      expect.objectContaining({ user: { id: userId, name, email, role } }),
    );
  });

  it('should throw an error because the findByEmail returned a null value', async () => {
    authRepository.findByEmail.mockResolvedValue(null);

    await expect(() => usecase.execute(email, password)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw an error because the password is wrong', async () => {
    hasherServiceMock.compare.mockResolvedValue(false);

    await expect(() => usecase.execute(email, password)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
