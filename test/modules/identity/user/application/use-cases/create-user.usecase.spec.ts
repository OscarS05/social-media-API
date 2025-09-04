import { InternalServerErrorException } from '@nestjs/common';
import { CreateUserUseCase } from '../../../../../../src/modules/identity/users/application/use-cases/create-user.usecase';
import { UserRepositoryMock } from '../../infrastructure/adapters/db/user.repository';
import { UuidServiceMock } from '../../infrastructure/adapters/services/uuid.service';
import { userModule as module } from '../../user.module';

describe('CreateUserUseCase', () => {
  let usecase: CreateUserUseCase;
  let userRepository: UserRepositoryMock;
  let uuidServiceMock: UuidServiceMock;

  const userId = '123';
  const name = 'test';
  const role = 'member';
  const now = expect.any(Date) as Date;

  const userData = {
    id: userId,
    name,
    role,
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(async () => {
    const testingModule = await module;
    usecase = testingModule.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = testingModule.get('IUserRepository');
    uuidServiceMock = testingModule.get('IUuidService');

    userRepository.createUser.mockResolvedValue(userData);
    uuidServiceMock.generateId.mockReturnValue(userId);
  });

  it('should return a user data successfully', async () => {
    const result = await usecase.execute(name);

    expect(userRepository.createUser).toHaveBeenCalledTimes(1);
    expect(userRepository.createUser).toHaveBeenCalledWith(
      expect.objectContaining(userData),
    );
    expect(uuidServiceMock.generateId).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(userData);
  });

  it('should throw an error because the creation of user return a null', async () => {
    userRepository.createUser.mockResolvedValue(null);

    await expect(usecase.execute(name)).rejects.toThrow(InternalServerErrorException);
  });
});
