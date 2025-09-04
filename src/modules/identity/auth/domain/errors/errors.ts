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
  constructor() {
    super('Non-local accounts cannot have a password.');
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
  constructor() {
    super('Invalid email.');
    this.name = 'InvalidEmailError';
  }
}
