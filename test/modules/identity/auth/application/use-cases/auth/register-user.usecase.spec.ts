import { RegisterUserUseCase } from '../../../../../../../src/modules/identity/auth/application/use-cases/auth/Register-user.usecase';
import { IAuthRepositoryMock } from '../../../infrastructure/adapters/repositories/auth.repository';
import { CreateUserPortMock } from '../../../infrastructure/adapters/services/createUser.port';
import { IUuidServiceMock } from '../../../infrastructure/adapters/services/uuid.service';
import { IHasherServiceMock } from '../../../infrastructure/adapters/services/hasher.service';
import { InternalServerErrorException } from '@nestjs/common';
import { authModule } from '../../../auth.module-mock';

describe('RegisterUserUseCase', () => {
  let usecase: RegisterUserUseCase;
  let authRepository: IAuthRepositoryMock;
  let createUserPortMock: CreateUserPortMock;
  let uuidServiceMock: IUuidServiceMock;
  let hasherServiceMock: IHasherServiceMock;

  const name = 'test admin';
  const email = 'test@email.com';
  const password = 'Password@123';
  const passHashed = '$2b$10$HlQ2Y8102RDYvJQvINaJ6e.VfFgl4MhRTFcoIGC5vHTjx1r8sQm5S';
  const authId = 'd883878e-16cf-47f4-87b3-670566abe41e';
  const userId = 'd883878e-16cf-47f4-87b3-670566abe41e';

  beforeEach(async () => {
    const module = await authModule;

    usecase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    authRepository = module.get('IAuthRepository');
    createUserPortMock = module.get('CreateUserPort');
    uuidServiceMock = module.get('IUuidService');
    hasherServiceMock = module.get('IHasherService');

    authRepository.findByEmail.mockResolvedValue({
      email,
      deletedAt: 'date',
      existsEmailToRegister: jest.fn().mockReturnValue(true),
    });
    authRepository.createAuth.mockResolvedValue({
      email,
      getEmail: email,
    });
    createUserPortMock.execute.mockResolvedValue({ id: userId, name });
    uuidServiceMock.generateId.mockReturnValue(authId);
    hasherServiceMock.hash.mockResolvedValue(passHashed);
  });

  it('should return a user data successfully', async () => {
    const now = expect.any(Date) as Date;

    const result = await usecase.execute(name, email, password);

    expect(authRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(createUserPortMock.execute).toHaveBeenCalledWith(name);
    expect(uuidServiceMock.generateId).toHaveBeenCalledTimes(1);
    expect(hasherServiceMock.hash).toHaveBeenCalledWith(password, 10);
    expect(authRepository.createAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        id: authId,
        userId,
        provider: 'local',
        isVerified: false,
        createdAt: now,
        updatedAt: now,
        email,
        password: passHashed,
      }),
    );
    expect(result).toStrictEqual({ user: { id: userId, name, email } });
  });

  it('should throw an error because the creation of auth return a null', async () => {
    authRepository.createAuth.mockRejectedValue(new InternalServerErrorException());

    await expect(usecase.execute(name, email, password)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
