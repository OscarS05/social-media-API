import { Test, TestingModule } from '@nestjs/testing';
import { UserRepositoryMock } from './infrastructure/adapters/db/user.repository';
import { UuidServiceMock } from './infrastructure/adapters/services/uuid.service';
import { CreateUserUseCase } from '../../../../src/modules/identity/users/application/use-cases/create-user.usecase';

export const userModule: Promise<TestingModule> = Test.createTestingModule({
  providers: [
    { provide: 'IUserRepository', useClass: UserRepositoryMock },
    { provide: 'IUuidService', useClass: UuidServiceMock },
    CreateUserUseCase,
  ],
}).compile();
