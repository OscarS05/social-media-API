import { Test, TestingModule } from '@nestjs/testing';

import { SessionManagerService } from '../../../../../src/modules/auth/application/services/session-manager.service';
import { TokenService } from '../../../../../src/modules/auth/domain/services/token.service';
import { HasherService } from '../../../../../src/modules/auth/domain/services/hasher.service';
import { UuidService } from '../../../../../src/modules/auth/domain/services/uuid.service';
import { SessionRepository } from '../../../../../src/modules/auth/domain/repositories/session.repository';
import { SessionEntity } from '../../../../../src/modules/auth/domain/entities/session.entity';
import { Roles } from '../../../../../src/modules/auth/domain/enums/roles.enum';
import { SessionContext } from '../../../../../src/modules/auth/domain/types/session';
import { MockJwtService } from '../../infrastructure/adapters/services/jwtToken.service';
import { MockHasherService } from '../../infrastructure/adapters/services/hasher.service';
import { MockUuidService } from '../../infrastructure/adapters/services/uuid.service';
import { MockSessionRepository } from '../../infrastructure/adapters/repositories/session.repository';
import {
  ACCESS_TOKEN,
  buildSessionEntity,
  NEW_ACCESS_TOKEN,
  NEW_REFRESH_TOKEN,
  NEW_REFRESH_TOKEN_HASHED,
  REFRESH_TOKEN,
  REFRESH_TOKEN_HASHED,
} from '../../../../factories/session.factory';

describe('SessionManagerService', () => {
  let service: SessionManagerService;
  const tokenService = new MockJwtService();
  const hasherService = new MockHasherService();
  const uuidService = new MockUuidService();
  const sessionRepository = new MockSessionRepository();

  const session = buildSessionEntity();

  const sessionContext: SessionContext = {
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: TokenService, useValue: tokenService },
        { provide: HasherService, useValue: hasherService },
        { provide: UuidService, useValue: uuidService },
        { provide: SessionRepository, useValue: sessionRepository },
        SessionManagerService,
      ],
    }).compile();

    service = module.get<SessionManagerService>(SessionManagerService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a session and persist the refresh token', async () => {
    uuidService.generate.mockReturnValue(session.id);
    tokenService.accessToken.mockReturnValue(ACCESS_TOKEN);
    tokenService.refreshToken.mockReturnValue(REFRESH_TOKEN);
    tokenService.getRefreshTokenExpiration.mockReturnValue(session.expiresAt);
    hasherService.hash.mockResolvedValue(session.tokenHashed);
    sessionRepository.create.mockResolvedValue(session);

    const result = await service.createSession(sessionContext, session.userId, Roles.MEMBER);

    expect(uuidService.generate).toHaveBeenCalledTimes(1);
    expect(tokenService.accessToken).toHaveBeenCalledWith({
      sub: session.userId,
      role: Roles.MEMBER,
    });
    expect(tokenService.refreshToken).toHaveBeenCalledWith({
      sub: session.userId,
      jti: session.id,
      version: 1,
    });
    expect(hasherService.hash).toHaveBeenCalledWith(REFRESH_TOKEN);
    expect(sessionRepository.create).toHaveBeenCalledTimes(1);

    expect(session).toBeInstanceOf(SessionEntity);
    expect(session.id).toBe(session.id);
    expect(session.userId).toBe(session.userId);
    expect(session.tokenHashed).toBe(session.tokenHashed);
    expect(session.version).toBe(1);
    expect(session.userAgent).toBe(sessionContext.userAgent);
    expect(session.ipAddress).toBe(sessionContext.ipAddress);
    expect(session.expiresAt).toEqual(session.expiresAt);

    expect(result).toEqual({ accessToken: ACCESS_TOKEN, refreshToken: REFRESH_TOKEN });
  });

  it('should rotate an existing session and update repository state', async () => {
    const existingSession = buildSessionEntity({
      version: 1,
      tokenHashed: REFRESH_TOKEN_HASHED,
      expiresAt: session.expiresAt,
    });

    tokenService.accessToken.mockReturnValue(NEW_ACCESS_TOKEN);
    tokenService.refreshToken.mockReturnValue(NEW_REFRESH_TOKEN);
    tokenService.getRefreshTokenExpiration.mockReturnValue(session.expiresAt);
    hasherService.hash.mockResolvedValue(NEW_REFRESH_TOKEN_HASHED);
    sessionRepository.update.mockResolvedValue(undefined);

    const result = await service.rotateSession(existingSession, Roles.MEMBER);

    expect(tokenService.accessToken).toHaveBeenCalledWith({
      sub: session.userId,
      role: Roles.MEMBER,
    });
    expect(tokenService.refreshToken).toHaveBeenCalledWith({
      sub: session.userId,
      jti: session.id,
      version: 2,
    });
    expect(hasherService.hash).toHaveBeenCalledWith(NEW_REFRESH_TOKEN);
    expect(sessionRepository.update).toHaveBeenCalledTimes(1);

    expect(existingSession.tokenHashed).toBe(NEW_REFRESH_TOKEN_HASHED);
    expect(existingSession.version).toBe(2);
    expect(existingSession.expiresAt).toEqual(session.expiresAt);
    expect(existingSession.revoked).toBe(false);

    expect(sessionRepository.update).toHaveBeenCalledWith(session.id, {
      tokenHashed: NEW_REFRESH_TOKEN_HASHED,
      version: 2,
      expiresAt: session.expiresAt,
      revoked: false,
    });
    expect(result).toEqual({ accessToken: NEW_ACCESS_TOKEN, refreshToken: NEW_REFRESH_TOKEN });
  });
});
