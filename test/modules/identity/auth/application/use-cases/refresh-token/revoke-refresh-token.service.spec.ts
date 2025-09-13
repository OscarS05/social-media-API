import { InternalServerErrorException } from '@nestjs/common';

import { UserAgentParsed } from '../../../../../../../src/modules/identity/auth/domain/services/userAgent.service';
import { RevokeRefreshTokenUseCase } from '../../../../../../../src/modules/identity/auth/application/use-cases/refresh-token/revoke-refresh-token.usecase';
import { authModule } from '../../../auth.module-mock';
import { MockRefreshTokenRepository } from '../../../infrastructure/adapters/repositories/refreshToken.repository';
import { IHasherServiceMock } from '../../../infrastructure/adapters/services/hasher.service';
import { MockJwtService } from '../../../infrastructure/adapters/services/jwt.service';
import { InvalidTokenError } from '../../../../../../../src/modules/identity/auth/domain/errors/refreshToken.errors';

describe('RevokeRefreshTokenUseCase', () => {
  let usecase: RevokeRefreshTokenUseCase;
  let refreshTokenRepo: MockRefreshTokenRepository;
  let hasherService: IHasherServiceMock;
  let jwtService: MockJwtService;

  const refreshTokenJwt =
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

  const payload = { jti: refreshTokenId, sub: userId };

  beforeAll(async () => {
    const module = await authModule;

    usecase = module.get<RevokeRefreshTokenUseCase>(RevokeRefreshTokenUseCase);
    jwtService = module.get('JwtService');
    hasherService = module.get('IHasherService');
    refreshTokenRepo = module.get('IRefreshTokenRepository');
  });

  beforeEach(() => {
    jwtService.verify.mockReturnValue(payload);
    refreshTokenRepo.findByIdAndUserId.mockResolvedValue(DbData);
    hasherService.compare.mockResolvedValue(true);
    refreshTokenRepo.update.mockResolvedValue({ affected: 1 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    const result = await usecase.execute(refreshTokenJwt);

    // jwtService
    expect(jwtService.verify).toHaveBeenCalledTimes(1);
    expect(jwtService.verify).toHaveBeenCalledWith(refreshTokenJwt, {
      secret: expect.any(String) as string,
    });
    expect(jwtService.verify.mock.results[0].value).toEqual(payload);
    // Repository
    expect(refreshTokenRepo.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepo.findByIdAndUserId).toHaveBeenCalledWith(
      refreshTokenId,
      userId,
    );
    await expect(
      refreshTokenRepo.findByIdAndUserId.mock.results[0].value,
    ).resolves.toEqual(DbData);
    // HasherService
    expect(hasherService.compare).toHaveBeenCalledTimes(1);
    expect(hasherService.compare).toHaveBeenCalledWith(refreshTokenJwt, tokenHashed);
    expect(hasherService.compare.mock.results[0].value).toBeTruthy();
    // Repository
    expect(refreshTokenRepo.update).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepo.update).toHaveBeenCalledWith(refreshTokenId, {
      revoked: true,
    });
    await expect(refreshTokenRepo.update.mock.results[0].value).resolves.toEqual({
      affected: 1,
    });
    expect(result.revokeResult).toBeTruthy();
  });

  it('should throw an error because the jwtService.verify failed', async () => {
    jwtService.verify.mockImplementation(() => {
      throw new InvalidTokenError();
    });

    await expect(() => usecase.execute(refreshTokenJwt)).rejects.toThrow(
      InvalidTokenError,
    );

    // jwtService
    expect(jwtService.verify).toHaveBeenCalledTimes(1);
    // Repository
    expect(refreshTokenRepo.findByIdAndUserId).toHaveBeenCalledTimes(0);
    // HasherService
    expect(hasherService.compare).toHaveBeenCalledTimes(0);
    // Repository
    expect(refreshTokenRepo.update).toHaveBeenCalledTimes(0);
  });

  it('should throw an error because the refreshTokenRepo.findByIdAndUserId failed', async () => {
    refreshTokenRepo.findByIdAndUserId.mockImplementation(() => {
      throw new InternalServerErrorException();
    });

    await expect(() => usecase.execute(refreshTokenJwt)).rejects.toThrow(
      InternalServerErrorException,
    );

    // jwtService
    expect(jwtService.verify).toHaveBeenCalledTimes(1);
    // Repository
    expect(refreshTokenRepo.findByIdAndUserId).toHaveBeenCalledTimes(1);
    // HasherService
    expect(hasherService.compare).toHaveBeenCalledTimes(0);
    // Repository
    expect(refreshTokenRepo.update).toHaveBeenCalledTimes(0);
  });

  it('should throw an error because the refreshTokenRepo.findByIdAndUserId not found the token', async () => {
    refreshTokenRepo.findByIdAndUserId.mockImplementation(() => {
      throw new InvalidTokenError();
    });

    await expect(() => usecase.execute(refreshTokenJwt)).rejects.toThrow(
      InvalidTokenError,
    );

    // jwtService
    expect(jwtService.verify).toHaveBeenCalledTimes(1);
    // Repository
    expect(refreshTokenRepo.findByIdAndUserId).toHaveBeenCalledTimes(1);
    // HasherService
    expect(hasherService.compare).toHaveBeenCalledTimes(0);
    // Repository
    expect(refreshTokenRepo.update).toHaveBeenCalledTimes(0);
  });

  it('should throw an error because the hasherService.compare not found the token', async () => {
    hasherService.compare.mockResolvedValue(false);

    await expect(() => usecase.execute(refreshTokenJwt)).rejects.toThrow(
      InvalidTokenError,
    );

    // jwtService
    expect(jwtService.verify).toHaveBeenCalledTimes(1);
    // Repository
    expect(refreshTokenRepo.findByIdAndUserId).toHaveBeenCalledTimes(1);
    // HasherService
    expect(hasherService.compare).toHaveBeenCalledTimes(1);
    // Repository
    expect(refreshTokenRepo.update).toHaveBeenCalledTimes(0);
  });

  it('should throw an error because the refreshTokenRepo.update not found the token', async () => {
    refreshTokenRepo.update.mockResolvedValue({ affected: 0 });

    await expect(() => usecase.execute(refreshTokenJwt)).rejects.toThrow(
      InternalServerErrorException,
    );

    // jwtService
    expect(jwtService.verify).toHaveBeenCalledTimes(1);
    // Repository
    expect(refreshTokenRepo.findByIdAndUserId).toHaveBeenCalledTimes(1);
    // HasherService
    expect(hasherService.compare).toHaveBeenCalledTimes(1);
    // Repository
    expect(refreshTokenRepo.update).toHaveBeenCalledTimes(1);
  });
});
