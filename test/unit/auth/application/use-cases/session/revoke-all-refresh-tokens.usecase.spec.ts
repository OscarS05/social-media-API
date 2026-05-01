import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';

import { RevokeAllSessionsUseCase } from '../../../../../../src/modules/auth/application/use-cases/session/revoke-all-sessions.usecase';
import { SessionRepository } from '../../../../../../src/modules/auth/domain/repositories/session.repository';
import { MockSessionRepository } from '../../../infrastructure/adapters/repositories/session.repository';

describe('RevokeAllSessionsUseCase', () => {
  let usecase: RevokeAllSessionsUseCase;
  const sessionRepository = new MockSessionRepository();
  const userId = '68c07572-ff80-8326-8aff-3d109fbd5bcb';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: SessionRepository, useValue: sessionRepository },
        RevokeAllSessionsUseCase,
      ],
    }).compile();

    usecase = module.get<RevokeAllSessionsUseCase>(RevokeAllSessionsUseCase);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    //resolved falso para testear que el caso de uso no retorna nada
    sessionRepository.updateByUserId.mockResolvedValue({ affected: 3 });
  });

  it('should revoke all user sessions successfully', async () => {
    await expect(usecase.execute(userId)).resolves.toBeUndefined();

    expect(sessionRepository.updateByUserId).toHaveBeenCalledTimes(1);
    expect(sessionRepository.updateByUserId).toHaveBeenCalledWith(userId, {
      revoked: true,
    });
  });

  it('should throw an error when the repository update fails', async () => {
    sessionRepository.updateByUserId.mockRejectedValue(new InternalServerErrorException());

    await expect(usecase.execute(userId)).rejects.toThrow(InternalServerErrorException);
    expect(sessionRepository.updateByUserId).toHaveBeenCalledTimes(1);
  });
});
