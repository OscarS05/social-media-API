import { DomainEventPublisher } from '../../../../../../src/shared/domain/events/domain-event-publisher';

export class MockDomainEvent extends DomainEventPublisher {
  publish = jest.fn();
}
