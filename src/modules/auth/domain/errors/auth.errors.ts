export class DomainError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class AccountNotVerifiedError extends DomainError {
  constructor() {
    super('Account not verified.');
    this.name = 'AccountNotVerifiedError';
  }
}

export class InvalidProviderError extends DomainError {
  constructor(message?: string) {
    super(message || 'Non-local accounts cannot have a password.');
    this.name = 'InvalidProviderError';
  }
}

export class EmailAlreadyInUseError extends DomainError {
  constructor() {
    super('Email already in use');
    this.name = 'EmailAlreadyInUseError';
  }
}

export class InvalidEmailError extends DomainError {
  constructor(message?: string | string[]) {
    super(Array.isArray(message) ? message.join(', ') : message || 'Invalid email.');
    this.name = 'InvalidEmailError';
  }
}

export class InvalidIdError extends DomainError {
  constructor() {
    super('Invalid id');
    this.name = 'InvalidIdError';
  }
}

export class InvalidPasswordError extends DomainError {
  constructor(message?: string) {
    super(message || 'Invalid password');
    this.name = 'InvalidPasswordError';
  }
}

export class InvalidTokenError extends DomainError {
  constructor(message?: string) {
    super(message || 'Invalid token');
    this.name = 'InvalidTokenError';
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor(message?: string) {
    super(message || 'Invalid credentials');
    this.name = 'InvalidCredentialsError';
  }
}

export class InvalidHashError extends DomainError {
  constructor(message?: string) {
    super(message || 'Invalid hash');
    this.name = 'InvalidHashError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message?: string) {
    super(message || 'Unauthorized');
    this.name = 'UnauthorizedError';
  }
}
