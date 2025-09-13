import { VerifyRefreshTokenUseCase } from '../../../../../../../src/modules/identity/auth/application/use-cases/refresh-token/verify-refresh-token.usecase';
import { UserAgentParsed } from '../../../../../../../src/modules/identity/auth/domain/services/userAgent.service';
import {
  InvalidIPAddressError,
  InvalidTokenError,
  InvalidUserAgentError,
  RefreshTokenRevokedError,
} from '../../../../../../../src/modules/identity/auth/domain/errors/refreshToken.errors';
import { authModule } from '../../../auth.module-mock';
import { IHasherServiceMock } from '../../../infrastructure/adapters/services/hasher.service';
import { MockRefreshTokenRepository } from '../../../infrastructure/adapters/repositories/refreshToken.repository';
import { MockJwtService } from '../../../infrastructure/adapters/services/jwt.service';
import { MockUserAgentService } from '../../../infrastructure/adapters/services/userAgent.service';
import { MockIpAddressService } from '../../../infrastructure/adapters/services/ipAddressParser.service';

describe('VerifyRefreshTokenUseCase', () => {
  let usecase: VerifyRefreshTokenUseCase;
  let refreshTokenRepo: MockRefreshTokenRepository;
  let hasherService: IHasherServiceMock;
  let jwtService: MockJwtService;
  let userAgentService: MockUserAgentService;
  let ipAddressService: MockIpAddressService;

  // Input
  const jwtInput =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';
  const userAgent: string = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36`;
  const ipAddress: string = '127.0.0.1';

  // Db
  const date = new Date();
  const now = new Date();
  const expiration = date.setDate(now.getDate() + 30);
  const refreshTokenId: string = 'b8ae448b-6435-4a5b-888e-e945b808ca8a';
  const userAgentParsed: UserAgentParsed = {
    browser: { name: 'IEMobile' },
    os: { name: 'Windows' },
    device: { type: 'mobile', vendor: 'nokia', model: 'Lumia 635' },
  };
  const tokenHashed: string =
    '$2b$10$.dPEexCNqjgbMdE.etF6sO91fIcAH0oGQ3meuMeX0zkHEow/y3Blm';
  const userId: string = '68c07572-ff80-8326-8aff-3d109fbd5bcb';

  const payload = { jti: refreshTokenId, sub: userId };

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

  beforeAll(async () => {
    const module = await authModule;

    usecase = module.get<VerifyRefreshTokenUseCase>(VerifyRefreshTokenUseCase);
    jwtService = module.get('JwtService');
    refreshTokenRepo = module.get('IRefreshTokenRepository');
    hasherService = module.get('IHasherService');
    ipAddressService = module.get('IpAddressService');
    userAgentService = module.get('UserAgentService');
  });

  beforeEach(() => {
    jwtService.verify.mockReturnValue(payload);
    refreshTokenRepo.findByIdAndUserId.mockResolvedValue(DbData);
    hasherService.compare.mockResolvedValue(true);
    ipAddressService.isValid.mockReturnValue(true);
    ipAddressService.normalize.mockReturnValue(ipAddress);
    userAgentService.parse.mockReturnValue(userAgentParsed);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return userId successfully', async () => {
    const expectedResult = {
      refreshTokenId,
      userId,
    };

    const result = await usecase.execute(jwtInput, userAgent, ipAddress);

    expect(jwtService.verify).toHaveBeenCalledTimes(1);
    expect(jwtService.verify.mock.results[0].value).toStrictEqual(payload);
    expect(refreshTokenRepo.findByIdAndUserId).toHaveBeenCalledTimes(1);
    await expect(
      refreshTokenRepo.findByIdAndUserId.mock.results[0].value,
    ).resolves.toStrictEqual(expect.objectContaining(DbData));
    expect(hasherService.compare).toHaveBeenCalledTimes(1);
    expect(hasherService.compare).toBeTruthy();
    expect(ipAddressService.isValid).toHaveBeenCalledTimes(1);
    expect(ipAddressService.isValid).toBeTruthy();
    expect(userAgentService.parse).toHaveBeenCalledTimes(1);
    expect(userAgentService.parse.mock.results[0].value).toStrictEqual(userAgentParsed);
    expect(result).toMatchObject(expect.objectContaining(expectedResult));
  });

  it('should throw an error because the refreshToken jwt is wrong', async () => {
    jwtService.verify.mockImplementation(() => {
      throw new InvalidTokenError();
    });
    await expect(usecase.execute(jwtInput, userAgent, ipAddress)).rejects.toThrow(
      InvalidTokenError,
    );

    expect(jwtService.verify).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepo.findByIdAndUserId).toHaveBeenCalledTimes(0);
    expect(hasherService.compare).toHaveBeenCalledTimes(0);
    expect(ipAddressService.isValid).toHaveBeenCalledTimes(0);
    expect(userAgentService.parse).toHaveBeenCalledTimes(0);
  });

  it('should throw an error because the refreshToken does not exist in db', async () => {
    refreshTokenRepo.findByIdAndUserId.mockRejectedValue(new InvalidTokenError());
    await expect(() => usecase.execute(jwtInput, userAgent, ipAddress)).rejects.toThrow(
      InvalidTokenError,
    );

    expect(jwtService.verify).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepo.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(hasherService.compare).toHaveBeenCalledTimes(0);
    expect(ipAddressService.isValid).toHaveBeenCalledTimes(0);
    expect(userAgentService.parse).toHaveBeenCalledTimes(0);
  });

  it('should throw an error because the refreshToken does not match the db refreshToken', async () => {
    hasherService.compare.mockReturnValue(false);
    await expect(() => usecase.execute(jwtInput, userAgent, ipAddress)).rejects.toThrow(
      InvalidTokenError,
    );

    expect(jwtService.verify).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepo.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(hasherService.compare).toHaveBeenCalledTimes(1);
    expect(ipAddressService.isValid).toHaveBeenCalledTimes(0);
    expect(userAgentService.parse).toHaveBeenCalledTimes(0);
  });

  it('should throw an error because the ip is invalid', async () => {
    ipAddressService.isValid.mockReturnValue(false);
    await expect(() => usecase.execute(jwtInput, userAgent, ipAddress)).rejects.toThrow(
      InvalidIPAddressError,
    );

    expect(jwtService.verify).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepo.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(hasherService.compare).toHaveBeenCalledTimes(1);
    expect(ipAddressService.isValid).toHaveBeenCalledTimes(1);
    expect(userAgentService.parse).toHaveBeenCalledTimes(0);
  });

  it('should throw an error because the ip does not march the db ip', async () => {
    const anotherIpAddress = '208.67.222.222';
    ipAddressService.normalize.mockReturnValue(anotherIpAddress);

    await expect(() =>
      usecase.execute(jwtInput, userAgent, anotherIpAddress),
    ).rejects.toThrow(InvalidIPAddressError);

    expect(jwtService.verify).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepo.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(hasherService.compare).toHaveBeenCalledTimes(1);
    expect(ipAddressService.isValid).toHaveBeenCalledTimes(1);
    expect(userAgentService.parse).toHaveBeenCalledTimes(0);
  });

  it('should throw an error because the userAgent does not match the db userAgent', async () => {
    const mobileUserAgent = `Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36
(KHTML, like Gecko) Chrome/116.0.5845.96 Mobile Safari/537.36`;
    const mobileUserAgentParsed: UserAgentParsed = {
      browser: { name: 'Chrome' },
      device: { vendor: 'Samsung', model: 'SM-G991B', type: 'mobile' },
      os: { name: 'Android' },
    };
    userAgentService.parse.mockReturnValue(mobileUserAgentParsed);

    await expect(() =>
      usecase.execute(jwtInput, mobileUserAgent, ipAddress),
    ).rejects.toThrow(InvalidUserAgentError);

    expect(jwtService.verify).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepo.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(hasherService.compare).toHaveBeenCalledTimes(1);
    expect(ipAddressService.isValid).toHaveBeenCalledTimes(1);
    expect(userAgentService.parse).toHaveBeenCalledTimes(1);
  });

  it('should throw an error because the token is revoked', async () => {
    const dbDataInvalidToken = {
      ...DbData,
      revoked: true,
      isActive: () => {
        throw new RefreshTokenRevokedError();
      },
    };
    refreshTokenRepo.findByIdAndUserId.mockResolvedValue(dbDataInvalidToken);

    await expect(() => usecase.execute(jwtInput, userAgent, ipAddress)).rejects.toThrow(
      RefreshTokenRevokedError,
    );

    expect(jwtService.verify).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepo.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(hasherService.compare).toHaveBeenCalledTimes(0);
    expect(ipAddressService.isValid).toHaveBeenCalledTimes(0);
    expect(userAgentService.parse).toHaveBeenCalledTimes(0);
  });
});
