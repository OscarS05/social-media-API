import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';

import { LoginWithOAuthUseCase } from '../../../../../../src/modules/auth/application/use-cases/users/login-with-oauth';
import { UserRepository } from '../../../../../../src/modules/auth/domain/repositories/user.repository';
import { UuidService } from '../../../../../../src/modules/auth/domain/services/uuid.service';
import { SessionManagerService } from '../../../../../../src/modules/auth/application/services/session-manager.service';
import { AuthProvider } from '../../../../../../src/modules/auth/domain/enums/providers.enum';
import { OAuthProfile } from '../../../../../../src/modules/auth/domain/types/auth';
import { Roles } from '../../../../../../src/modules/auth/domain/enums/roles.enum';
import {
  buildUserEntity,
  EMAIL,
  ID,
  NAME,
  PROVIDER_ID,
} from '../../../../../factories/user.factory';
import {
  ACCESS_TOKEN,
  IP_ADDRESS,
  REFRESH_TOKEN,
  USER_AGENT,
} from '../../../../../factories/session.factory';
import { UserRepositoryMock } from '../../../infrastructure/adapters/repositories/user.repository';
import { MockUuidService } from '../../../infrastructure/adapters/services/uuid.service';
import { sessionManagerService } from '../../../infrastructure/adapters/services/sessionManager.service';
import { EmailAlreadyInUseError } from '../../../../../../src/modules/auth/domain/errors/auth.errors';
import { MockTransactionManager } from '../../../infrastructure/adapters/services/transaction-manager';
import { TransactionManager } from '../../../../../../src/modules/auth/domain/services/transaction-manager.service';
import { MockDomainEvent } from '../../../infrastructure/adapters/events/domain-event.mock';
import { DomainEventPublisher } from '../../../../../../src/shared/domain/events/domain-event-publisher';

describe('LoginWithOAuthUseCase', () => {
  let usecase: LoginWithOAuthUseCase;
  const userRepository = new UserRepositoryMock();
  const uuidService = new MockUuidService();
  const transactionManager = new MockTransactionManager();
  const mockDomainEvent = new MockDomainEvent();
  const sessionContext = {
    userAgent: USER_AGENT,
    ipAddress: IP_ADDRESS,
  };
  const profile: OAuthProfile = {
    providerId: PROVIDER_ID,
    email: EMAIL,
    name: NAME,
  };
  const tokens = { accessToken: ACCESS_TOKEN, refreshToken: REFRESH_TOKEN };

  const userOAuth = buildUserEntity({
    id: ID,
    provider: AuthProvider.GOOGLE,
    providerId: PROVIDER_ID,
    email: EMAIL,
    name: NAME,
    password: undefined,
    isVerified: true,
  });

  const useCaseResponse = {
    user: userOAuth.toBasic(),
    tokens: { ...tokens },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UserRepository, useValue: userRepository },
        { provide: UuidService, useValue: uuidService },
        { provide: SessionManagerService, useValue: sessionManagerService },
        { provide: TransactionManager, useValue: transactionManager },
        { provide: DomainEventPublisher, useValue: mockDomainEvent },
        LoginWithOAuthUseCase,
      ],
    }).compile();

    usecase = module.get<LoginWithOAuthUseCase>(LoginWithOAuthUseCase);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    uuidService.generate.mockReturnValue(ID);
    sessionManagerService.createSession.mockResolvedValue(tokens);
    transactionManager.runInTransaction.mockImplementation((fn: () => Promise<any>) => fn());
    mockDomainEvent.publish.mockResolvedValue('');
  });

  it('should return existing user when provider id already exists', async () => {
    userRepository.findByProviderId.mockResolvedValue(userOAuth);

    const result = await usecase.execute(profile, AuthProvider.GOOGLE, sessionContext);

    expect(userRepository.findByProviderId).toHaveBeenCalledWith(
      AuthProvider.GOOGLE,
      PROVIDER_ID,
    );
    expect(uuidService.generate).not.toHaveBeenCalled();
    expect(userRepository.createUser).not.toHaveBeenCalled();
    expect(sessionManagerService.createSession).toHaveBeenCalledWith(
      sessionContext,
      ID,
      Roles.MEMBER,
    );
    expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    expect(result).toEqual(useCaseResponse);
  });

  it('should create a new user when provider id is not found', async () => {
    userRepository.findByProviderId.mockResolvedValue(null);
    userRepository.createUser.mockResolvedValue(userOAuth);

    const result = await usecase.execute(profile, AuthProvider.GOOGLE, sessionContext);

    expect(userRepository.findByProviderId).toHaveBeenCalledWith(
      AuthProvider.GOOGLE,
      PROVIDER_ID,
    );
    expect(uuidService.generate).toHaveBeenCalledTimes(1);
    expect(userRepository.createUser).toHaveBeenCalledTimes(1);
    expect(transactionManager.runInTransaction).toHaveBeenCalledTimes(1);
    expect(result).toEqual(useCaseResponse);
  });

  it('should rethrow error when user creation fails', async () => {
    userRepository.findByProviderId.mockResolvedValue(null);
    userRepository.createUser.mockRejectedValue(new InternalServerErrorException());

    await expect(
      usecase.execute(profile, AuthProvider.GOOGLE, sessionContext),
    ).rejects.toThrow(InternalServerErrorException);

    expect(uuidService.generate).toHaveBeenCalledTimes(1);
    expect(userRepository.createUser).toHaveBeenCalledTimes(1);
    expect(transactionManager.runInTransaction).toHaveBeenCalledTimes(1);
    expect(sessionManagerService.createSession).not.toHaveBeenCalled();
  });

  it('should throw an error when email is already in use', async () => {
    // Same provider and providerId but diferent email
    userRepository.findByProviderId.mockResolvedValue({
      ...userOAuth,
      email: 'another@email.com',
    });

    await expect(
      usecase.execute(profile, AuthProvider.GOOGLE, sessionContext),
    ).rejects.toThrow(EmailAlreadyInUseError);

    expect(uuidService.generate).not.toHaveBeenCalled();
    expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    expect(userRepository.createUser).not.toHaveBeenCalled();
  });

  it('should ensure transaction atomicity: if session creation fails, user creation is not persisted', async () => {
    userRepository.findByProviderId.mockResolvedValue(null);
    userRepository.createUser.mockResolvedValue(userOAuth);
    sessionManagerService.createSession.mockRejectedValue(
      new InternalServerErrorException('Session creation failed'),
    );

    await expect(
      usecase.execute(profile, AuthProvider.GOOGLE, sessionContext),
    ).rejects.toThrow(InternalServerErrorException);

    // Verify that createUser was called (transaction was initiated)
    expect(userRepository.createUser).toHaveBeenCalledTimes(1);
    // But the transaction should have been attempted
    expect(transactionManager.runInTransaction).toHaveBeenCalledTimes(1);
  });

  it('should ensure transaction atomicity: if event publication fails, user and session creation are not persisted', async () => {
    userRepository.findByProviderId.mockResolvedValue(null);
    userRepository.createUser.mockResolvedValue(userOAuth);
    sessionManagerService.createSession.mockResolvedValue(useCaseResponse);
    mockDomainEvent.publish.mockRejectedValue(new InternalServerErrorException());

    await expect(
      usecase.execute(profile, AuthProvider.GOOGLE, sessionContext),
    ).rejects.toThrow(InternalServerErrorException);

    // Verify that createUser was called (transaction was initiated)
    expect(userRepository.createUser).toHaveBeenCalledTimes(1);
    // But the transaction should have been attempted
    expect(transactionManager.runInTransaction).toHaveBeenCalledTimes(1);
    expect(sessionManagerService.createSession).toHaveBeenCalledTimes(1);
    expect(mockDomainEvent.publish).toHaveBeenCalledTimes(1);
  });
});
