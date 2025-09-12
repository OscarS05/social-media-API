import { DomainError } from './auth.errors';

export class InvalidTokenError extends DomainError {
  constructor(message?: string) {
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
  constructor(message?: string) {
    super(message ?? 'Invalid ip address');
    this.name = 'InvalidIPAddressError';
  }
}

export class InvalidExpiresAtError extends DomainError {
  constructor(message: string) {
    super(message ?? 'Invalid ip address');
    this.name = 'InvalidExpiresAtError';
  }
}

export class RefreshTokenExpiredError extends DomainError {
  constructor() {
    super('Refresh token has expired');
    this.name = 'RefreshTokenExpiredError';
  }
}

export class RefreshTokenRevokedError extends DomainError {
  constructor() {
    super('Refresh token is revoked');
    this.name = 'RefreshTokenRevokedError';
  }
}
