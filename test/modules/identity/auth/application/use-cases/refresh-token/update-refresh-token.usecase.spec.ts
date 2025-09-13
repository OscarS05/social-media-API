import { InternalServerErrorException } from '@nestjs/common';

import { authModule } from '../../../auth.module-mock';
import { UpdateRefreshTokenUseCase } from '../../../../../../../src/modules/identity/auth/application/use-cases/refresh-token/update-refresh-token.usecase';
import { UserAgentParsed } from '../../../../../../../src/modules/identity/auth/domain/services/userAgent.service';
import { MockRefreshTokenRepository } from '../../../infrastructure/adapters/repositories/refreshToken.repository';
import { IHasherServiceMock } from '../../../infrastructure/adapters/services/hasher.service';
import { MockJwtService } from '../../../infrastructure/adapters/services/jwt.service';
import { SessionDataVerified } from '../../../../../../../src/modules/identity/auth/domain/dtos/verifiedSession.dto';

describe('UpdateRefreshTokenUseCase', () => {
  let usecase: UpdateRefreshTokenUseCase;
  let refreshTokenRepo: MockRefreshTokenRepository;
  let hasherService: IHasherServiceMock;
  let jwtService: MockJwtService;

  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';
  const date = new Date();
  const now = new Date();
  const expiration = date.setDate(now.getDate() + 30);
  const refreshTokenId: string = 'b8ae448b-6435-4a5b-888e-e945b808ca8a';
  const userAgentParsed: UserAgentParsed = {
    browser: { name: 'IEMobile' },
    os: { name: 'Windows' },
    device: { type: 'mobile', vendor: 'nokia', model: 'Lumia 635' },
  };
  const ipAddress: string = '127.0.0.1';
  const tokenHashed: string =
    '$2b$10$.dPEexCNqjgbMdE.etF6sO91fIcAH0oGQ3meuMeX0zkHEow/y3Blm';
  const newTokenHashed = '$2b$10$E6L30bsoK/Rq02DsFZRPZOUV2noP/ibh0cuwB98LpIPUoJQmmWkJe';
  const userId: string = '68c07572-ff80-8326-8aff-3d109fbd5bcb';

  const DbData = {
    id: refreshTokenId,
    userId,
    tokenHashed,
    revoked: false,
    userAgent: userAgentParsed,
    ipAddress,
    expiresAt: new Date(expiration),
    createdAt: new Date(),
    getIp: ipAddress,
    getUserAgent: userAgentParsed,
    getTokenHashed: tokenHashed,
    getId: refreshTokenId,
    isActive: () => jest.fn(),
  };

  const sessionDataVerified: SessionDataVerified = {
    refreshTokenId,
    userId,
  };

  beforeAll(async () => {
    const module = await authModule;

    usecase = module.get<UpdateRefreshTokenUseCase>(UpdateRefreshTokenUseCase);
    jwtService = module.get('JwtService');
    hasherService = module.get('IHasherService');
    refreshTokenRepo = module.get('IRefreshTokenRepository');
  });

  beforeEach(() => {
    jwtService.sign.mockReturnValue(jwt);
    hasherService.hash.mockResolvedValue(newTokenHashed);
    refreshTokenRepo.update.mockResolvedValue(DbData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the data successfully', async () => {
    const argumentsToUpdateInDb = {
      tokenHashed: newTokenHashed,
      expiresAt: expect.any(Date) as Date,
      updatedAt: expect.any(Date) as Date,
      revoked: false,
    };

    const result = await usecase.execute(sessionDataVerified);

    expect(jwtService.sign).toHaveBeenCalledTimes(1);
    expect(jwtService.sign.mock.results[0].value).toEqual(jwt);
    expect(hasherService.hash).toHaveBeenCalledTimes(1);
    await expect(hasherService.hash.mock.results[0].value).resolves.toEqual(
      newTokenHashed,
    );
    expect(refreshTokenRepo.update).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepo.update).toHaveBeenCalledWith(
      refreshTokenId,
      argumentsToUpdateInDb,
    );
    await expect(refreshTokenRepo.update.mock.results[0].value).resolves.toEqual(DbData);
    expect(result.refreshToken).toBe(jwt);
  });

  it('should throw an error because the jwtService.sign failed', async () => {
    jwtService.sign.mockImplementation(() => {
      throw new InternalServerErrorException();
    });

    await expect(() => usecase.execute(sessionDataVerified)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(jwtService.sign).toHaveBeenCalledTimes(1);
    expect(hasherService.hash).toHaveBeenCalledTimes(0);
    expect(refreshTokenRepo.update).toHaveBeenCalledTimes(0);
  });

  it('should throw an error because the hasherService.hash failed', async () => {
    hasherService.hash.mockImplementation(() => {
      throw new InternalServerErrorException();
    });

    await expect(() => usecase.execute(sessionDataVerified)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(jwtService.sign).toHaveBeenCalledTimes(1);
    expect(hasherService.hash).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepo.update).toHaveBeenCalledTimes(0);
  });

  it('should throw an error because the refreshTokenRepo.update failed', async () => {
    refreshTokenRepo.update.mockImplementation(() => {
      throw new InternalServerErrorException();
    });

    await expect(() => usecase.execute(sessionDataVerified)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(jwtService.sign).toHaveBeenCalledTimes(1);
    expect(hasherService.hash).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepo.update).toHaveBeenCalledTimes(1);
  });

  it('should throw an error because the refreshTokenRepo.update returned null', async () => {
    refreshTokenRepo.update.mockResolvedValue({ affected: 0 });

    await expect(() => usecase.execute(sessionDataVerified)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(jwtService.sign).toHaveBeenCalledTimes(1);
    expect(hasherService.hash).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepo.update).toHaveBeenCalledTimes(1);
  });
});
