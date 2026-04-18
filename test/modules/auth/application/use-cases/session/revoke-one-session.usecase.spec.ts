import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';

import { RevokeOneSessionUseCase } from '../../../../../../src/modules/auth/application/use-cases/session/revoke-one-session.usecase';
import { TokenService } from '../../../../../../src/modules/auth/domain/services/token.service';
import { SessionRepository } from '../../../../../../src/modules/auth/domain/repositories/session.repository';
import {
  UnauthorizedError,
  InvalidTokenError,
} from '../../../../../../src/modules/auth/domain/errors/auth.errors';
import { SessionNotFoundError } from '../../../../../../src/modules/auth/domain/errors/session.errors';
import { MockJwtService } from '../../../infrastructure/adapters/services/jwtToken.service';
import { MockSessionRepository } from '../../../infrastructure/adapters/repositories/session.repository';
import { buildSessionEntity, REFRESH_TOKEN } from '../../../../../factories/session.factory';

describe('RevokeOneSessionUseCase', () => {
  let usecase: RevokeOneSessionUseCase;
  const tokenService = new MockJwtService();
  const sessionRepository = new MockSessionRepository();

  const session = buildSessionEntity();
  const payload = { jti: session.id, sub: session.userId };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: TokenService, useValue: tokenService },
        { provide: SessionRepository, useValue: sessionRepository },
        RevokeOneSessionUseCase,
      ],
    }).compile();

    usecase = module.get<RevokeOneSessionUseCase>(RevokeOneSessionUseCase);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    tokenService.verifyRefreshToken.mockReturnValue(payload);
    sessionRepository.findByIdAndUserId.mockResolvedValue(session);
    sessionRepository.update.mockResolvedValue({ affected: 1 });
  });

  it('should be defined', () => {
    expect(usecase).toBeDefined();
  });

  it('should revoke a valid session', async () => {
    await expect(usecase.execute(REFRESH_TOKEN, session.userId)).resolves.toBeUndefined();

    expect(tokenService.verifyRefreshToken).toHaveBeenCalledTimes(1);
    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(REFRESH_TOKEN);
    expect(sessionRepository.findByIdAndUserId).toHaveBeenCalledWith(
      session.id,
      session.userId,
    );
    expect(sessionRepository.update).toHaveBeenCalledWith(session.id, { revoked: true });
  });

  it('should throw UnauthorizedError when token user does not match', async () => {
    tokenService.verifyRefreshToken.mockReturnValue({
      jti: session.id,
      sub: 'another-user-id',
    });

    await expect(usecase.execute(REFRESH_TOKEN, session.userId)).rejects.toThrow(
      UnauthorizedError,
    );

    expect(sessionRepository.findByIdAndUserId).not.toHaveBeenCalled();
    expect(sessionRepository.update).not.toHaveBeenCalled();
  });

  it('should throw SessionNotFoundError when session is missing', async () => {
    sessionRepository.findByIdAndUserId.mockResolvedValue(null);

    await expect(usecase.execute(REFRESH_TOKEN, session.userId)).rejects.toThrow(
      SessionNotFoundError,
    );

    expect(sessionRepository.findByIdAndUserId).toHaveBeenCalledWith(
      session.id,
      session.userId,
    );
    expect(sessionRepository.update).not.toHaveBeenCalled();
  });

  it('should rethrow repository update errors', async () => {
    sessionRepository.update.mockRejectedValue(new InternalServerErrorException());

    await expect(usecase.execute(REFRESH_TOKEN, session.userId)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(sessionRepository.update).toHaveBeenCalledWith(session.id, { revoked: true });
  });

  it('should throw InvalidTokenError when refresh token verification fails', async () => {
    tokenService.verifyRefreshToken.mockImplementation(() => {
      throw new InvalidTokenError();
    });

    await expect(usecase.execute(REFRESH_TOKEN, session.userId)).rejects.toThrow(
      InvalidTokenError,
    );

    expect(sessionRepository.findByIdAndUserId).not.toHaveBeenCalled();
    expect(sessionRepository.update).not.toHaveBeenCalled();
  });
});
