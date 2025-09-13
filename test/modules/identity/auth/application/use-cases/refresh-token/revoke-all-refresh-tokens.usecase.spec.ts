import { InternalServerErrorException } from '@nestjs/common';
import { RevokeAllRefreshTokensUseCase } from '../../../../../../../src/modules/identity/auth/application/use-cases/refresh-token/revoke-all-refresh-tokens.usecase';
import { authModule } from '../../../auth.module-mock';
import { MockRefreshTokenRepository } from '../../../infrastructure/adapters/repositories/refreshToken.repository';

describe('RevokeAllRefreshTokensUseCase', () => {
  let usecase: RevokeAllRefreshTokensUseCase;
  let refreshTokenRepo: MockRefreshTokenRepository;

  const userId: string = '68c07572-ff80-8326-8aff-3d109fbd5bcb';

  beforeEach(async () => {
    const module = await authModule;

    usecase = module.get<RevokeAllRefreshTokensUseCase>(RevokeAllRefreshTokensUseCase);
  });

  beforeAll(async () => {
    const module = await authModule;

    usecase = module.get<RevokeAllRefreshTokensUseCase>(RevokeAllRefreshTokensUseCase);
    refreshTokenRepo = module.get('IRefreshTokenRepository');
  });

  beforeEach(() => {
    refreshTokenRepo.updateByUserId.mockResolvedValue({ affected: 3 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a successful response', async () => {
    const result = await usecase.execute(userId);

    expect(refreshTokenRepo.updateByUserId).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepo.updateByUserId).toHaveBeenCalledWith(userId, {
      revoked: true,
    });
    await expect(refreshTokenRepo.updateByUserId.mock.results[0].value).resolves.toEqual({
      affected: 3,
    });
    expect(result.refreshTokensRevoked).toBe(3);
  });

  it('should return a successful response but the db did not find anything', async () => {
    refreshTokenRepo.updateByUserId.mockResolvedValue({ affected: 0 });

    const result = await usecase.execute(userId);

    expect(refreshTokenRepo.updateByUserId).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepo.updateByUserId).toHaveBeenCalledWith(userId, {
      revoked: true,
    });
    await expect(refreshTokenRepo.updateByUserId.mock.results[0].value).resolves.toEqual({
      affected: 0,
    });
    expect(result.refreshTokensRevoked).toBe(0);
  });

  it('should throw an error', async () => {
    refreshTokenRepo.updateByUserId.mockRejectedValue(new InternalServerErrorException());

    await expect(usecase.execute(userId)).rejects.toThrow(InternalServerErrorException);

    expect(refreshTokenRepo.updateByUserId).toHaveBeenCalledTimes(1);
  });
});
