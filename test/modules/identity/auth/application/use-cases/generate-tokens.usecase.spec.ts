import { Test, TestingModule } from '@nestjs/testing';
import { GenerateTokensUseCase } from '../../../../../../src/modules/identity/auth/application/use-cases/generate-tokens.usecase';
import { Roles } from '../../../../../../src/modules/identity/auth/domain/entities/roles.enum';

describe('GenerateTokensUseCase', () => {
  let usecase: GenerateTokensUseCase;
  const jwtService = {
    sign: jest.fn(),
  };
  const access_token = 'jwt-123';
  const userData = { id: '123', role: Roles.MEMBER, name: 'name', email: 'email' };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: 'JwtService', useValue: jwtService }, GenerateTokensUseCase],
    }).compile();

    usecase = module.get<GenerateTokensUseCase>(GenerateTokensUseCase);
  });

  beforeEach(() => {
    jwtService.sign.mockReturnValue(access_token);
  });

  it('should return an access_token', () => {
    const result = usecase.execute(userData);

    expect(result).toBe(access_token);
  });
});
