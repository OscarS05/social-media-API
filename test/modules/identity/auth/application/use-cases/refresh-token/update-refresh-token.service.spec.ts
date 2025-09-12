import { authModule } from '../../../auth.module-mock';
import { VerifyRefreshTokenUseCase } from '../../../../../../../src/modules/identity/auth/application/use-cases/refresh-token/verify-refresh-token.usecase';

describe('VerifyRefreshTokenUseCase', () => {
  let service: VerifyRefreshTokenUseCase;

  beforeAll(async () => {
    const module = await authModule;

    service = module.get<VerifyRefreshTokenUseCase>(VerifyRefreshTokenUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
