import { InternalServerErrorException } from '@nestjs/common';

import { IAuthRepositoryMock } from '../../infrastructure/adapters/repositories/auth.repository';
import { CreateUserPortMock } from '../../infrastructure/adapters/services/createUser.port';
import { IUuidServiceMock } from '../../infrastructure/adapters/services/uuid.service';
import { authModule } from '../../auth.module-mock';
import { AuthProvider } from '../../../../../../src/modules/identity/auth/domain/enums/providers.enum';
import { InvalidNameError } from '../../../../../../src/modules/identity/users/domain/errors/errors';
import { FacebookProvider } from '../../../../../../src/modules/identity/auth/domain/services/facebookProvider.service';
import { RegisterUserWithFacebookUseCase } from '../../../../../../src/modules/identity/auth/application/use-cases/register-user-with-facebook.usecase';

describe('RegisterUserWithFacebookUseCase', () => {
  let usecase: RegisterUserWithFacebookUseCase;
  let authRepository: IAuthRepositoryMock;
  let createUserPortMock: CreateUserPortMock;
  let uuidServiceMock: IUuidServiceMock;

  const name = 'test admin';
  const email = 'test@email.com';
  const role = 'member';
  const authId = 'd883878e-16cf-47f4-1234-670566abe41e';
  const provider_user_id = 'd883878e-16cf-47f4-5678-670566abe41e';
  const userId = 'd883878e-16cf-47f4-87b3-670566abe41e';
  let facebookProfile: FacebookProvider;

  beforeEach(async () => {
    const module = await authModule;

    usecase = module.get<RegisterUserWithFacebookUseCase>(
      RegisterUserWithFacebookUseCase,
    );
    authRepository = module.get('IAuthRepository');
    createUserPortMock = module.get('CreateUserPort');
    uuidServiceMock = module.get('IUuidService');

    authRepository.createAuth.mockResolvedValue({
      email,
      getEmail: email,
      provider: AuthProvider.FACEBOOK,
      provider_user_id,
    });
    createUserPortMock.execute.mockResolvedValue({ id: userId, email, name, role });
    uuidServiceMock.generateId.mockReturnValue(authId);
    facebookProfile = { providerId: provider_user_id, email, name };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a user data if the user_provider_id already exists', async () => {
    authRepository.findByProviderId.mockResolvedValue({
      email,
      getEmail: email,
      user: { id: userId, name, role },
      provider: AuthProvider.FACEBOOK,
      id: provider_user_id,
    });

    const result = await usecase.execute(facebookProfile);

    expect(authRepository.findByProviderId).toHaveBeenCalledWith(
      AuthProvider.FACEBOOK,
      provider_user_id,
    );
    expect(createUserPortMock.execute).not.toHaveBeenCalledTimes(1);
    expect(uuidServiceMock.generateId).not.toHaveBeenCalledTimes(1);
    expect(authRepository.createAuth).not.toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual({
      user: { id: userId, name, email, role },
    });
  });

  it('should return the new user successfully', async () => {
    authRepository.findByProviderId.mockResolvedValue(null);

    const now = expect.any(Date) as Date;

    const result = await usecase.execute(facebookProfile);

    expect(authRepository.findByProviderId).toHaveBeenCalledWith(
      AuthProvider.FACEBOOK,
      provider_user_id,
    );
    expect(createUserPortMock.execute).toHaveBeenCalledTimes(1);
    expect(createUserPortMock.execute).toHaveBeenCalledWith(name);
    expect(uuidServiceMock.generateId).toHaveBeenCalledTimes(1);
    expect(authRepository.createAuth).toHaveBeenCalledTimes(1);
    expect(authRepository.createAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        id: authId,
        userId,
        provider: 'facebook',
        providerUserId: provider_user_id,
        isVerified: true,
        createdAt: now,
        updatedAt: now,
        email,
      }),
    );
    expect(result).toStrictEqual({ user: { id: userId, role, name, email } });
  });

  it('should throw an error because the creation of user returns error', async () => {
    const name = 'SELECT * FROM users;';
    authRepository.createAuth.mockResolvedValue(null);
    createUserPortMock.execute.mockRejectedValue(new InvalidNameError());
    facebookProfile.name = name;

    await expect(usecase.execute(facebookProfile)).rejects.toThrow(InvalidNameError);
    expect(authRepository.findByProviderId).toHaveBeenCalledTimes(1);
    expect(authRepository.createAuth).toHaveBeenCalledTimes(0);
    expect(createUserPortMock.execute).toHaveBeenCalledTimes(1);
    expect(createUserPortMock.execute).toHaveBeenCalledWith(name);
    expect(uuidServiceMock.generateId).toHaveBeenCalledTimes(0);
  });

  it('should throw an error because the creation of auth return a null', async () => {
    authRepository.createAuth.mockResolvedValue(null);

    await expect(usecase.execute(facebookProfile)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
