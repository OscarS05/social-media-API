import { Injectable } from '@nestjs/common';

import { UserRepository } from '../../../domain/repositories/user.repository';
import { UuidService } from '../../../domain/services/uuid.service';
import { OAuthProfile } from '../../../domain/types/auth';
import { UserEntity } from '../../../domain/entities/user.entity';
import { AuthProvider } from '../../../domain/enums/providers.enum';
import { LoginData, SessionContext } from '../../../domain/types/session';
import { SessionManagerService } from '../../services/session-manager.service';
import { EmailAlreadyInUseError } from '../../../domain/errors/auth.errors';
import { TransactionManager } from '../../../domain/services/transaction-manager.service';
import { DomainEventPublisher } from '../../../../../shared/domain/events/domain-event-publisher';

@Injectable()
export class LoginWithOAuthUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionManagerService: SessionManagerService,
    private readonly uuidService: UuidService,
    private readonly transactionManager: TransactionManager,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async execute(
    profile: OAuthProfile,
    provider: AuthProvider,
    sessionContext: SessionContext,
  ): Promise<LoginData> {
    const user = await this.userRepository.findByProviderId(provider, profile.providerId);
    if (user && user.email === profile.email) return this.buildResponse(user, sessionContext);
    if (user && user.email !== profile.email) throw new EmailAlreadyInUseError();

    return this.transactionManager.runInTransaction(async () => {
      const newUser: UserEntity = await this.userRepository.createUser(
        UserEntity.create({
          id: this.uuidService.generate(),
          name: profile.name,
          email: profile.email,
          provider,
          isVerified: true,
          providerId: profile.providerId,
        }),
      );

      const result = await this.buildResponse(newUser, sessionContext);

      newUser.addDomainEvent = {
        id: newUser.id,
        name: newUser.name,
        avatarUrl: profile.avatar,
      };

      await this.eventPublisher.publish(newUser.domainEvents);
      newUser.clearEvents();

      return result;
    });
  }

  private async buildResponse(
    user: UserEntity,
    sessionContext: SessionContext,
  ): Promise<LoginData> {
    const tokens = await this.sessionManagerService.createSession(
      sessionContext,
      user.id,
      user.role,
    );

    return {
      user: user.toBasic(),
      tokens,
    };
  }
}
