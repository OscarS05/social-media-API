import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCaseService } from '../../../../../../src/modules/identity/auth/application/use-cases/login.usecase';

describe('LoginUseCaseService', () => {
  let service: LoginUseCaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginUseCaseService],
    }).compile();

    service = module.get<LoginUseCaseService>(LoginUseCaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
