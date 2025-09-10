import { DomainError } from './auth.errors';

export class InvalidTokenError extends DomainError {
  constructor(message: string) {
    super(message ?? 'Invalid token');
    this.name = 'InvalidTokenError';
  }
}

export class InvalidUserAgentError extends DomainError {
  constructor(message: string) {
    super(message ?? 'Invalid user agent');
    this.name = 'InvalidUserAgentError';
  }
}

export class InvalidIPAddressError extends DomainError {
  constructor(message: string) {
    super(message ?? 'Invalid ip address');
    this.name = 'InvalidIPAddressError';
  }
}
