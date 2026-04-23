import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEventPublisher } from '../../domain/events/domain-event-publisher';

// This adapter needs to be migrated to notifications/infrastructure/
@Injectable()
export class EventEmitterPublisher extends DomainEventPublisher {
  constructor(private readonly emitter: EventEmitter2) {
    super();
  }

  async publish(events: object[]): Promise<void> {
    for (const event of events) {
      await this.emitter.emitAsync(event.constructor.name, event);
    }
  }
}
