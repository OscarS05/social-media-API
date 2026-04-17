import { Test, TestingModule } from '@nestjs/testing';

import { RefreshSessionUseCase } from '../../../../../../src/modules/auth/application/use-cases/session/refresh-session.usecase';
import { SessionManagerService } from '../../../../../../src/modules/auth/application/services/session-manager.service';
import { TokenService } from '../../../../../../src/modules/auth/domain/services/token.service';
import { HasherService } from '../../../../../../src/modules/auth/domain/services/hasher.service';
import { SessionRepository } from '../../../../../../src/modules/auth/domain/repositories/session.repository';
import { Roles } from '../../../../../../src/modules/auth/domain/enums/roles.enum';
import { SessionContext } from '../../../../../../src/modules/auth/domain/types/session';
import { InvalidTokenError } from '../../../../../../src/modules/auth/domain/errors/session.errors';
import { MockJwtService } from '../../../infrastructure/adapters/services/jwtToken.service';
import { MockHasherService } from '../../../infrastructure/adapters/services/hasher.service';
import { MockSessionRepository } from '../../../infrastructure/adapters/repositories/session.repository';
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  NEW_ACCESS_TOKEN,
  NEW_REFRESH_TOKEN,
  REFRESH_TOKEN_HASHED,
  buildSessionEntity,
  USER_AGENT,
} from '../../../../../factories/session.factory';
import { sessionManagerService } from '../../../infrastructure/adapters/services/sessionManager.service';

describe('RefreshSessionUseCase', () => {
  let usecase: RefreshSessionUseCase;
  const tokenService = new MockJwtService();
  const hasherService = new MockHasherService();
  const sessionRepository = new MockSessionRepository();

  const session = buildSessionEntity({ tokenHashed: REFRESH_TOKEN_HASHED });
  const sessionContext: SessionContext = {
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
  };
  const payloadAccessToken = {
    sub: session.userId,
    role: Roles.MEMBER,
  };

  const payloadRefreshToken = {
    sub: session.userId,
    jti: session.id,
    version: session.version,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: TokenService, useValue: tokenService },
        { provide: HasherService, useValue: hasherService },
        { provide: SessionRepository, useValue: sessionRepository },
        { provide: SessionManagerService, useValue: sessionManagerService },
        RefreshSessionUseCase,
      ],
    }).compile();

    usecase = module.get<RefreshSessionUseCase>(RefreshSessionUseCase);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(usecase).toBeDefined();
  });

  it('should return new tokens when refresh data is valid', async () => {
    tokenService.verifyAccessToken.mockReturnValue(payloadAccessToken);
    tokenService.verifyRefreshToken.mockReturnValue(payloadRefreshToken);
    sessionRepository.findByIdAndUserId.mockResolvedValue(session);
    hasherService.compare.mockResolvedValue(true);
    sessionManagerService.rotateSession.mockResolvedValue({
      accessToken: NEW_ACCESS_TOKEN,
      refreshToken: NEW_REFRESH_TOKEN,
    });

    const result = await usecase.execute(sessionContext, {
      accessToken: ACCESS_TOKEN,
      refreshToken: REFRESH_TOKEN,
    });

    expect(tokenService.verifyAccessToken).toHaveBeenCalledWith(ACCESS_TOKEN);
    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(REFRESH_TOKEN);
    expect(sessionRepository.findByIdAndUserId).toHaveBeenCalledWith(
      session.id,
      session.userId,
    );
    expect(hasherService.compare).toHaveBeenCalledWith(REFRESH_TOKEN, session.tokenHashed);
    expect(sessionManagerService.rotateSession).toHaveBeenCalledWith(
      session,
      payloadAccessToken.role,
    );
    expect(result).toEqual({ accessToken: NEW_ACCESS_TOKEN, refreshToken: NEW_REFRESH_TOKEN });
  });

  it('should throw an error when access token verification fails', async () => {
    tokenService.verifyAccessToken.mockImplementation(() => {
      throw new InvalidTokenError();
    });

    await expect(
      usecase.execute(sessionContext, {
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN,
      }),
    ).rejects.toThrow(InvalidTokenError);

    expect(tokenService.verifyRefreshToken).not.toHaveBeenCalled();
    expect(sessionRepository.findByIdAndUserId).not.toHaveBeenCalled();
  });

  it('should throw when refresh token verification fails', async () => {
    tokenService.verifyRefreshToken.mockImplementation(() => {
      throw new InvalidTokenError();
    });
    tokenService.verifyAccessToken.mockReturnValue(payloadAccessToken);

    await expect(
      usecase.execute(sessionContext, {
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN,
      }),
    ).rejects.toThrow(InvalidTokenError);

    expect(sessionRepository.findByIdAndUserId).not.toHaveBeenCalled();
  });

  it('should throw when the session does not exist', async () => {
    tokenService.verifyAccessToken.mockReturnValue(payloadAccessToken);
    tokenService.verifyRefreshToken.mockReturnValue(payloadRefreshToken);
    sessionRepository.findByIdAndUserId.mockResolvedValue(null);

    await expect(
      usecase.execute(sessionContext, {
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN,
      }),
    ).rejects.toThrow('Session not found');

    expect(sessionRepository.findByIdAndUserId).toHaveBeenCalledWith(
      session.id,
      session.userId,
    );
  });

  it('should revoke all user sessions when refresh token version mismatches', async () => {
    tokenService.verifyAccessToken.mockReturnValue(payloadAccessToken);
    tokenService.verifyRefreshToken.mockReturnValue({ ...payloadRefreshToken, version: 10 });
    sessionRepository.findByIdAndUserId.mockResolvedValue(session);

    await expect(
      usecase.execute(sessionContext, {
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN,
      }),
    ).rejects.toThrow(InvalidTokenError);

    expect(sessionRepository.updateByUserId).toHaveBeenCalledWith(session.userId, {
      revoked: true,
    });
  });

  it('should revoke the session when refresh token hash does not match', async () => {
    tokenService.verifyAccessToken.mockReturnValue(payloadAccessToken);
    tokenService.verifyRefreshToken.mockReturnValue(payloadRefreshToken);
    sessionRepository.findByIdAndUserId.mockResolvedValue(session);
    hasherService.compare.mockResolvedValue(false);

    await expect(
      usecase.execute(sessionContext, {
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN,
      }),
    ).rejects.toThrow(InvalidTokenError);

    expect(sessionRepository.update).toHaveBeenCalledWith(session.id, { revoked: true });
    expect(session.revoked).toBe(true);
  });

  it('should revoke the session when context does not match', async () => {
    const session = buildSessionEntity({ tokenHashed: REFRESH_TOKEN_HASHED });
    const invalidContext: SessionContext = {
      ...sessionContext,
      userAgent: USER_AGENT,
    };
    tokenService.verifyAccessToken.mockReturnValue(payloadAccessToken);
    tokenService.verifyRefreshToken.mockReturnValue(payloadRefreshToken);
    sessionRepository.findByIdAndUserId.mockResolvedValue(session);
    hasherService.compare.mockResolvedValue(true);

    await expect(
      usecase.execute(invalidContext, {
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN,
      }),
    ).rejects.toThrow(InvalidTokenError);

    expect(sessionRepository.update).toHaveBeenCalledWith(session.id, { revoked: true });
    expect(session.revoked).toBe(true);
  });
});
