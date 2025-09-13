import { InternalServerErrorException } from '@nestjs/common';

import type { UserAgentParsed } from '../../../../../../../src/modules/identity/auth/domain/services/userAgent.service';
import { CreateRefreshTokenUseCase } from '../../../../../../../src/modules/identity/auth/application/use-cases/refresh-token/create-refresh-token.usecase';
import { authModule } from '../../../auth.module-mock';
import { IHasherServiceMock } from '../../../infrastructure/adapters/services/hasher.service';
import { MockIpAddressService } from '../../../infrastructure/adapters/services/ipAddressParser.service';
import { MockJwtService } from '../../../infrastructure/adapters/services/jwt.service';
import { MockUserAgentService } from '../../../infrastructure/adapters/services/userAgent.service';
import { IUuidServiceMock } from '../../../infrastructure/adapters/services/uuid.service';
import {
  InvalidIPAddressError,
  InvalidUserAgentError,
} from '../../../../../../../src/modules/identity/auth/domain/errors/refreshToken.errors';
import { MockRefreshTokenRepository } from '../../../infrastructure/adapters/repositories/refreshToken.repository';

describe('CreateRefreshTokenUseCase', () => {
  let usecase: CreateRefreshTokenUseCase;
  let uuidService: IUuidServiceMock;
  let hasherService: IHasherServiceMock;
  let refreshTokenService: MockRefreshTokenRepository;
  let jwtService: MockJwtService;
  let userAgentService: MockUserAgentService;
  let ipAddressService: MockIpAddressService;

  const date = new Date();
  const now = new Date();
  const expiration = date.setDate(now.getDate() + 30);
  const refreshTokenId: string = 'b8ae448b-6435-4a5b-888e-e945b808ca8a';
  const userId: string = '68c07572-ff80-8326-8aff-3d109fbd5bcb';
  const refreshTokenJwt: string =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';
  const tokenHashed: string =
    '$2b$10$.dPEexCNqjgbMdE.etF6sO91fIcAH0oGQ3meuMeX0zkHEow/y3Blm';
  const userAgent: string = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36`;
  const ipAddress: string = '127.0.0.1';
  const userAgentParsed: UserAgentParsed = {
    browser: { name: 'IEMobile' },
    os: { name: 'Windows' },
    device: { type: 'mobile', vendor: 'nokia', model: 'Lumia 635' },
  };

  const DbData = {
    id: refreshTokenId,
    userId,
    tokenHashed,
    revoked: false,
    userAgent,
    ipAddress,
    expiresAt: new Date(expiration),
  };

  beforeAll(async () => {
    const module = await authModule;
    usecase = module.get<CreateRefreshTokenUseCase>(CreateRefreshTokenUseCase);
    refreshTokenService = module.get('IRefreshTokenRepository');
    ipAddressService = module.get('IpAddressService');
    userAgentService = module.get('UserAgentService');
    uuidService = module.get('IUuidService');
    hasherService = module.get('IHasherService');
    jwtService = module.get('JwtService');
  });

  beforeEach(() => {
    ipAddressService.isValid.mockReturnValue(true);
    ipAddressService.normalize.mockReturnValue(ipAddress);
    userAgentService.parse.mockReturnValue(userAgentParsed);
    jwtService.sign.mockReturnValue(refreshTokenJwt);
    uuidService.generateId.mockReturnValue(refreshTokenId);
    hasherService.hash.mockResolvedValue(tokenHashed);
    refreshTokenService.create.mockResolvedValue(DbData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the refresh token successfully', async () => {
    const result = await usecase.execute(userId, userAgent, ipAddress);
    expect(ipAddressService.isValid).toHaveBeenCalledTimes(1);
    expect(ipAddressService.isValid).toHaveReturnedWith(true);
    expect(ipAddressService.normalize).toHaveBeenCalledTimes(1);
    expect(ipAddressService.normalize).toHaveReturnedWith(ipAddress);
    expect(userAgentService.parse).toHaveBeenCalledTimes(1);
    expect(userAgentService.parse).toHaveReturnedWith(userAgentParsed);
    expect(uuidService.generateId).toHaveBeenCalledTimes(1);
    expect(uuidService.generateId).toHaveReturnedWith(refreshTokenId);
    expect(jwtService.sign).toHaveBeenCalledTimes(1);
    expect(jwtService.sign).toHaveReturnedWith(refreshTokenJwt);
    expect(hasherService.hash).toHaveBeenCalledTimes(1);
    await expect(hasherService.hash.mock.results[0].value).resolves.toBe(tokenHashed);
    expect(refreshTokenService.create).toHaveBeenCalledTimes(1);
    await expect(refreshTokenService.create.mock.results[0].value).resolves.toStrictEqual(
      expect.objectContaining(DbData),
    );
    expect(result.refreshToken).toBe(refreshTokenJwt);
  });

  it('should throw an error because the ip is invalid', async () => {
    ipAddressService.isValid.mockReturnValue(false);

    await expect(() => usecase.execute(userId, userAgent, ipAddress)).rejects.toThrow(
      InvalidIPAddressError,
    );
    expect(ipAddressService.isValid).toHaveBeenCalledTimes(1);
    expect(ipAddressService.isValid).toHaveReturnedWith(false);
    expect(ipAddressService.normalize).toHaveBeenCalledTimes(0);
    expect(userAgentService.parse).toHaveBeenCalledTimes(0);
    expect(uuidService.generateId).toHaveBeenCalledTimes(0);
    expect(jwtService.sign).toHaveBeenCalledTimes(0);
    expect(hasherService.hash).toHaveBeenCalledTimes(0);
    expect(refreshTokenService.create).toHaveBeenCalledTimes(0);
  });

  it('should throw an error because userAgent is invalid', async () => {
    const badUserAgent = 'SELECT * FROM Auth;';
    await expect(() => usecase.execute(userId, badUserAgent, ipAddress)).rejects.toThrow(
      InvalidUserAgentError,
    );
    expect(ipAddressService.isValid).toHaveBeenCalledTimes(1);
    expect(ipAddressService.normalize).toHaveBeenCalledTimes(1);
    expect(userAgentService.parse).toHaveBeenCalledTimes(0);
    expect(uuidService.generateId).toHaveBeenCalledTimes(0);
    expect(hasherService.hash).toHaveBeenCalledTimes(0);
    expect(refreshTokenService.create).toHaveBeenCalledTimes(0);
    expect(jwtService.sign).toHaveBeenCalledTimes(0);
  });

  it('should throw an error because the authRepository failed', async () => {
    refreshTokenService.create.mockRejectedValue(new InternalServerErrorException());

    await expect(() => usecase.execute(userId, userAgent, ipAddress)).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(ipAddressService.isValid).toHaveBeenCalledTimes(1);
    expect(ipAddressService.normalize).toHaveBeenCalledTimes(1);
    expect(userAgentService.parse).toHaveBeenCalledTimes(1);
    expect(uuidService.generateId).toHaveBeenCalledTimes(1);
    expect(jwtService.sign).toHaveBeenCalledTimes(1);
    expect(hasherService.hash).toHaveBeenCalledTimes(1);
    expect(refreshTokenService.create).toHaveBeenCalledTimes(1);
  });
});
