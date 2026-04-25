import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../../../../auth/domain/events/user-created.event';
import { CreateProfileWithOAuthUseCase } from '../../application/use-cases/create-profile-after-oauth.usecase';

@Injectable()
export class UserCreatedListener {
  private readonly logger = new Logger(UserCreatedListener.name);

  constructor(
    private readonly createProfileAfterOAuthUseCase: CreateProfileWithOAuthUseCase,
  ) {}

  @OnEvent(UserCreatedEvent.name, { async: true })
  async handle(event: UserCreatedEvent): Promise<void> {
    try {
      await this.createProfileAfterOAuthUseCase.execute({
        userId: event.userId,
        name: event.name,
        avatarUrl: event.avatarUrl ?? null,
      });
    } catch (error) {
      this.logger.error(
        `Failed to create profile after OAuth. Event: UserCreatedEvent. userId: ${event.userId}, name: ${event.name}, avatarUrl: ${event.avatarUrl}`,
        error,
      );
      // When notifications/ with RabbitMQ are ready, this will disappears
    }
  }
}
