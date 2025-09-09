import { DomainError } from './auth.errors';

export class InvalidTokenError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTokenError';
  }
}
