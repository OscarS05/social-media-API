import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../../../../auth/domain/events/user-created.event';
import { CreateProfileWithOAuthUseCase } from '../../application/use-cases/create-profile-after-oauth.usecase';

@Injectable()
export class UserCreatedListener {
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
    } catch {
      // logging error
      // When notifications/ with RabbitMQ are ready, this will disappears
    }
  }
}
