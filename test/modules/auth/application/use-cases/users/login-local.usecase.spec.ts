import { Test, TestingModule } from '@nestjs/testing';

import { LoginUseCase } from '../../../../../../src/modules/auth/application/use-cases/users/login-local.usecase';
import { UserRepository } from '../../../../../../src/modules/auth/domain/repositories/user.repository';
import { HasherService } from '../../../../../../src/modules/auth/domain/services/hasher.service';
import { SessionManagerService } from '../../../../../../src/modules/auth/application/services/session-manager.service';
import { AuthProvider } from '../../../../../../src/modules/auth/domain/enums/providers.enum';
import { Roles } from '../../../../../../src/modules/auth/domain/enums/roles.enum';
import {
  InvalidCredentialsError,
  InvalidProviderError,
} from '../../../../../../src/modules/auth/domain/errors/auth.errors';
import { buildUserEntity, EMAIL, PASSWORD_PLAIN } from '../../../../../factories/user.factory';
import { UserRepositoryMock } from '../../../infrastructure/adapters/repositories/user.repository';
import { MockHasherService } from '../../../infrastructure/adapters/services/hasher.service';
import { sessionManagerService } from '../../../infrastructure/adapters/services/sessionManager.service';
import {
  ACCESS_TOKEN,
  IP_ADDRESS,
  REFRESH_TOKEN,
  USER_AGENT,
} from '../../../../../factories/session.factory';
import { SessionContext } from '../../../../../../src/modules/auth/domain/types/session';

describe('LoginUseCase', () => {
  let usecase: LoginUseCase;
  const userRepository = new UserRepositoryMock();
  const hasherService = new MockHasherService();

  const user = buildUserEntity();
  const sessionContext: SessionContext = {
    userAgent: USER_AGENT,
    ipAddress: IP_ADDRESS,
  };
  const tokens = { accessToken: ACCESS_TOKEN, refreshToken: REFRESH_TOKEN };
  const credentials = { email: EMAIL, password: PASSWORD_PLAIN };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UserRepository, useValue: userRepository },
        { provide: HasherService, useValue: hasherService },
        { provide: SessionManagerService, useValue: sessionManagerService },
        LoginUseCase,
      ],
    }).compile();

    usecase = module.get<LoginUseCase>(LoginUseCase);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    sessionManagerService.createSession.mockResolvedValue(tokens);
  });

  it('should login local user successfully', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    hasherService.compare.mockResolvedValue(true);

    const result = await usecase.execute(credentials, sessionContext);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(credentials.email);
    expect(hasherService.compare).toHaveBeenCalledWith(credentials.password, user.password);
    expect(sessionManagerService.createSession).toHaveBeenCalledWith(
      sessionContext,
      user.id,
      Roles.MEMBER,
    );
    expect(result).toEqual({
      user: { id: user.id, name: user.name, email: user.email, role: Roles.MEMBER },
      tokens,
    });
  });

  it('should throw InvalidCredentialsError when user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(usecase.execute(credentials, sessionContext)).rejects.toThrow(
      InvalidCredentialsError,
    );

    expect(hasherService.compare).not.toHaveBeenCalled();
    expect(sessionManagerService.createSession).not.toHaveBeenCalled();
  });

  it('should throw InvalidProviderError when user is not local', async () => {
    userRepository.findByEmail.mockResolvedValue(
      buildUserEntity({ provider: AuthProvider.GOOGLE }),
    );
    hasherService.compare.mockResolvedValue(true);

    await expect(usecase.execute(credentials, sessionContext)).rejects.toThrow(
      InvalidProviderError,
    );

    expect(hasherService.compare).not.toHaveBeenCalled();
    expect(sessionManagerService.createSession).not.toHaveBeenCalled();
  });

  it('should throw InvalidCredentialsError when password does not match', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    hasherService.compare.mockResolvedValue(false);

    await expect(usecase.execute(credentials, sessionContext)).rejects.toThrow(
      InvalidCredentialsError,
    );

    expect(sessionManagerService.createSession).not.toHaveBeenCalled();
  });
});
