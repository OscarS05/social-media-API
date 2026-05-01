import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';

import { RevokeOneSessionUseCase } from '../../../../../../src/modules/auth/application/use-cases/session/revoke-one-session.usecase';
import { SessionRepository } from '../../../../../../src/modules/auth/domain/repositories/session.repository';
import { UnauthorizedError } from '../../../../../../src/modules/auth/domain/errors/auth.errors';
import { SessionNotFoundError } from '../../../../../../src/modules/auth/domain/errors/session.errors';
import { MockSessionRepository } from '../../../infrastructure/adapters/repositories/session.repository';
import { buildSessionEntity } from '../../../../../factories/session.factory';

describe('RevokeOneSessionUseCase', () => {
  let usecase: RevokeOneSessionUseCase;
  const sessionRepository = new MockSessionRepository();

  const session = buildSessionEntity();
  const jti = session.id;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: SessionRepository, useValue: sessionRepository },
        RevokeOneSessionUseCase,
      ],
    }).compile();

    usecase = module.get<RevokeOneSessionUseCase>(RevokeOneSessionUseCase);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    sessionRepository.findByIdAndUserId.mockResolvedValue(session);
    sessionRepository.update.mockResolvedValue({ affected: 1 });
  });

  it('should be defined', () => {
    expect(usecase).toBeDefined();
  });

  it('should revoke a valid session', async () => {
    await expect(usecase.execute(jti, session.userId)).resolves.toBeUndefined();

    expect(sessionRepository.findByIdAndUserId).toHaveBeenCalledWith(
      session.id,
      session.userId,
    );
    expect(sessionRepository.update).toHaveBeenCalledWith(jti, { revoked: true });
  });

  it('should throw UnauthorizedError when the session does not belong to the user', async () => {
    await expect(usecase.execute(jti, 'fake-userId')).rejects.toThrow(UnauthorizedError);

    expect(sessionRepository.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(sessionRepository.update).not.toHaveBeenCalled();
  });

  it('should throw SessionNotFoundError when session is missing', async () => {
    sessionRepository.findByIdAndUserId.mockResolvedValue(null);

    await expect(usecase.execute(jti, session.userId)).rejects.toThrow(SessionNotFoundError);

    expect(sessionRepository.findByIdAndUserId).toHaveBeenCalledWith(
      session.id,
      session.userId,
    );
    expect(sessionRepository.update).not.toHaveBeenCalled();
  });

  it('should rethrow repository update errors', async () => {
    sessionRepository.update.mockRejectedValue(new InternalServerErrorException());

    await expect(usecase.execute(jti, session.userId)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(sessionRepository.update).toHaveBeenCalledWith(session.id, { revoked: true });
  });
});
