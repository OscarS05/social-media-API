import { Test, TestingModule } from '@nestjs/testing';
import { GenerateTokensUseCase } from '../../../../../../../src/modules/identity/auth/application/use-cases/auth/generate-tokens.usecase';
import { Roles } from '../../../../../../../src/modules/identity/auth/domain/enums/roles.enum';
import { ConfigService } from '@nestjs/config';

describe('GenerateTokensUseCase', () => {
  let usecase: GenerateTokensUseCase;
  const jwtService = {
    sign: jest.fn(),
  };
  const configService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        ACCESS_SECRET: 'test-secret',
        ACCESS_EXPIRES_IN: '15m',
      };
      return config[key];
    }),
  };
  const access_token = 'jwt-123';
  const userData = { id: '123', role: Roles.MEMBER, name: 'name', email: 'email' };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: 'JwtService', useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        GenerateTokensUseCase,
      ],
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
