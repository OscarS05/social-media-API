import { UserAgentParsed } from '../../../../../../../src/modules/identity/auth/domain/services/userAgent.service';
import { FindAllRefreshTokensUseCase } from '../../../../../../../src/modules/identity/auth/application/use-cases/refresh-token/find-all-refresh-tokens.usecase';
import { authModule } from '../../../auth.module-mock';
import { MockRefreshTokenRepository } from '../../../infrastructure/adapters/repositories/refreshToken.repository';

describe('FindAllRefreshTokensUseCase', () => {
  let usecase: FindAllRefreshTokensUseCase;
  let refreshTokenRepo: MockRefreshTokenRepository;

  const refreshTokenId: string = 'b8ae448b-6435-4a5b-888e-e945b808ca8a';
  const userAgentParsed: UserAgentParsed = {
    browser: { name: 'IEMobile' },
    os: { name: 'Windows' },
    device: { type: 'mobile', vendor: 'nokia', model: 'Lumia 635' },
  };
  const ipAddress: string = '127.0.0.1';
  const userId: string = '68c07572-ff80-8326-8aff-3d109fbd5bcb';

  const data = {
    id: refreshTokenId,
    userId,
    userAgent: userAgentParsed,
    ipAddress,
    revoked: false,
    expiresAt: expect.any(Date) as Date,
    createdAt: expect.any(Date) as Date,
    updatedAt: expect.any(Date) as Date,
  };

  const dbData = {
    ...data,
    toPublicObject: () => data,
  };

  beforeAll(async () => {
    const module = await authModule;

    usecase = module.get<FindAllRefreshTokensUseCase>(FindAllRefreshTokensUseCase);
    refreshTokenRepo = module.get('IRefreshTokenRepository');
  });

  beforeEach(() => {
    refreshTokenRepo.findAllByUserId.mockResolvedValue([dbData, dbData, dbData]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all refresh tokens in db', async () => {
    const result = await usecase.execute(userId);

    expect(refreshTokenRepo.findAllByUserId).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepo.findAllByUserId).toHaveBeenCalledWith(userId);
    console.log(refreshTokenRepo.findAllByUserId.mock.results[0].value);
    await expect(refreshTokenRepo.findAllByUserId.mock.results[0].value).resolves.toEqual(
      [dbData, dbData, dbData],
    );
    console.log('RESULT:', result);
    expect(result.refreshTokens).toEqual([data, data, data]);
  });

  it('should return an empty array because the findAllByUserId did not find anything', async () => {
    refreshTokenRepo.findAllByUserId.mockResolvedValue([]);

    const result = await usecase.execute(userId);

    expect(refreshTokenRepo.findAllByUserId).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepo.findAllByUserId).toHaveBeenCalledWith(userId);
    await expect(refreshTokenRepo.findAllByUserId.mock.results[0].value).resolves.toEqual(
      [],
    );
    expect(result.refreshTokens).toMatchObject([]);
  });
});
