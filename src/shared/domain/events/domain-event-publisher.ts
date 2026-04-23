export abstract class DomainEventPublisher {
  abstract publish(events: object[]): Promise<void>;
}
