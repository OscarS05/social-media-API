import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase } from '../../../../../../src/modules/identity/auth/application/use-cases/Register-user.usecase';
import { IAuthRepositoryMock } from '../../domain/repositories/auth.repository';
import { CreateUserPortMock } from '../../domain/ports/createUser.port';
import { IUuidServiceMock } from '../../domain/services/uuid.service';
import { IHasherServiceMock } from '../../domain/services/hasher.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('RegisterUserUseCase', () => {
  let usecase: RegisterUserUseCase;
  let authRepository: IAuthRepositoryMock;
  let createUserPortMock: CreateUserPortMock;
  let uuidServiceMock: IUuidServiceMock;
  let hasherServiceMock: IHasherServiceMock;

  const name = 'test';
  const email = 'test@email.com';
  const password = 'password';
  const passHashed = 'pass-hashed';
  const authId = 'uuid-123';
  const userId = '123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: 'IAuthRepository', useClass: IAuthRepositoryMock },
        { provide: 'CreateUserPort', useClass: CreateUserPortMock },
        { provide: 'IUuidService', useClass: IUuidServiceMock },
        { provide: 'IHasherService', useClass: IHasherServiceMock },
        RegisterUserUseCase,
      ],
    }).compile();

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
    authRepository.createAuth.mockResolvedValue({ email });
    createUserPortMock.execute.mockResolvedValue({ id: userId, name: 'test' });
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
    authRepository.createAuth.mockResolvedValue(null);

    await expect(usecase.execute(name, email, password)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
