import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase } from '../../../../src/modules/identity/auth/application/use-cases/Register-user.usecase';
import { IAuthRepositoryMock } from './infrastructure/adapters/repositories/auth.repository';
import { IUuidServiceMock } from './infrastructure/adapters/services/uuid.service';
import { IHasherServiceMock } from './infrastructure/adapters/services/hasher.service';
import { CreateUserPortMock } from './infrastructure/adapters/services/createUser.port';
import { LoginUseCase } from '../../../../src/modules/identity/auth/application/use-cases/Login.usecase';
import { RegisterUserWithGoogleUseCase } from '../../../../src/modules/identity/auth/application/use-cases/register-user-with-google.usecase';

export const authModule: Promise<TestingModule> = Test.createTestingModule({
  providers: [
    { provide: 'IAuthRepository', useClass: IAuthRepositoryMock },
    { provide: 'CreateUserPort', useClass: CreateUserPortMock },
    { provide: 'IUuidService', useClass: IUuidServiceMock },
    { provide: 'IHasherService', useClass: IHasherServiceMock },
    RegisterUserUseCase,
    LoginUseCase,
    RegisterUserWithGoogleUseCase,
  ],
}).compile();
