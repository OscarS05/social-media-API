import { Test, TestingModule } from '@nestjs/testing';

import { FindAllSessionsUseCase } from '../../../../../../src/modules/auth/application/use-cases/session/find-all-session.usecase';
import { SessionRepository } from '../../../../../../src/modules/auth/domain/repositories/session.repository';
import { MockSessionRepository } from '../../../infrastructure/adapters/repositories/session.repository';
import { buildSessionEntity } from '../../../../../factories/session.factory';

describe('FindAllSessionsUseCase', () => {
  let usecase: FindAllSessionsUseCase;
  const sessionRepository = new MockSessionRepository();

  const sessionOne = buildSessionEntity();
  const sessionTwo = buildSessionEntity({
    id: '4ccf7b8a-1d1a-4c0d-9b89-2ad3b1f4f3d4',
    userId: sessionOne.userId,
  });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: SessionRepository, useValue: sessionRepository },
        FindAllSessionsUseCase,
      ],
    }).compile();

    usecase = module.get<FindAllSessionsUseCase>(FindAllSessionsUseCase);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    sessionRepository.findAllByUserId.mockResolvedValue([sessionOne, sessionTwo]);
  });

  it('should be defined', () => {
    expect(usecase).toBeDefined();
  });

  it('should return all sessions for the user', async () => {
    const result = await usecase.execute(sessionOne.userId);

    expect(sessionRepository.findAllByUserId).toHaveBeenCalledTimes(1);
    expect(sessionRepository.findAllByUserId).toHaveBeenCalledWith(sessionOne.userId);
    expect(result).toEqual([sessionOne, sessionTwo]);
  });

  it('should return an empty array when no sessions exist', async () => {
    sessionRepository.findAllByUserId.mockResolvedValue([]);

    const result = await usecase.execute(sessionOne.userId);

    expect(sessionRepository.findAllByUserId).toHaveBeenCalledTimes(1);
    expect(sessionRepository.findAllByUserId).toHaveBeenCalledWith(sessionOne.userId);
    expect(result).toEqual([]);
  });
});
