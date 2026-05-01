import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';

import { RegisterUserUseCase } from '../../../../../../src/modules/auth/application/use-cases/users/register-with-local.usecase';
import { UserRepository } from '../../../../../../src/modules/auth/domain/repositories/user.repository';
import { UuidService } from '../../../../../../src/modules/auth/domain/services/uuid.service';
import { HasherService } from '../../../../../../src/modules/auth/domain/services/hasher.service';
import { EmailAlreadyInUseError } from '../../../../../../src/modules/auth/domain/errors/auth.errors';
import { UserRepositoryMock } from '../../../infrastructure/adapters/repositories/user.repository';
import { MockUuidService } from '../../../infrastructure/adapters/services/uuid.service';
import { MockHasherService } from '../../../infrastructure/adapters/services/hasher.service';
import {
  buildUserEntity,
  EMAIL,
  ADMIN_ID,
  NAME,
  PASSWORD_HASHED,
  PASSWORD_PLAIN,
} from '../../../../../factories/user.factory';

describe('RegisterUserUseCase', () => {
  let usecase: RegisterUserUseCase;
  const userRepository = new UserRepositoryMock();
  const uuidService = new MockUuidService();
  const hasherService = new MockHasherService();

  const user = buildUserEntity();
  const createUserData = {
    name: NAME,
    email: EMAIL,
    password: PASSWORD_PLAIN,
  };
  const passwordHashed = PASSWORD_HASHED;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UserRepository, useValue: userRepository },
        { provide: UuidService, useValue: uuidService },
        { provide: HasherService, useValue: hasherService },
        RegisterUserUseCase,
      ],
    }).compile();

    usecase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    uuidService.generate.mockReturnValue(ADMIN_ID);
    hasherService.hash.mockResolvedValue(passwordHashed);
  });

  it('should return user data successfully', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.createUser.mockResolvedValue(user);

    const result = await usecase.execute(createUserData);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(EMAIL);
    expect(uuidService.generate).toHaveBeenCalledTimes(1);
    expect(hasherService.hash).toHaveBeenCalledWith(PASSWORD_PLAIN);
    expect(userRepository.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        id: ADMIN_ID,
        name: NAME,
        email: EMAIL,
        provider: 'local',
        isVerified: false,
        password: passwordHashed,
      }),
    );
    expect(result).toEqual({ id: ADMIN_ID, name: NAME, email: EMAIL, role: 'member' });
  });

  it('should throw EmailAlreadyInUseError when user already exists', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'existing-id', email: EMAIL });

    await expect(usecase.execute(createUserData)).rejects.toThrow(EmailAlreadyInUseError);

    expect(userRepository.createUser).not.toHaveBeenCalled();
    expect(uuidService.generate).not.toHaveBeenCalled();
    expect(hasherService.hash).not.toHaveBeenCalled();
  });

  it('should rethrow repository errors during user creation', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.createUser.mockRejectedValue(new InternalServerErrorException());

    await expect(usecase.execute(createUserData)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(userRepository.findByEmail).toHaveBeenCalledWith(EMAIL);
    expect(uuidService.generate).toHaveBeenCalledTimes(1);
    expect(hasherService.hash).toHaveBeenCalledWith(PASSWORD_PLAIN);
    expect(userRepository.createUser).toHaveBeenCalledTimes(1);
  });
});
