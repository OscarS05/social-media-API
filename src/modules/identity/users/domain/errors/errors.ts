export class DomainError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class InvalidNameError extends DomainError {
  constructor() {
    super('Invalid name.');
    this.name = 'InvalidNameError';
  }
}

export class InvalidRoleError extends DomainError {
  constructor() {
    super('Invalid role');
    this.name = 'InvalidRoleError';
  }
}

export class InvalidIdError extends DomainError {
  constructor() {
    super('id is empty');
    this.name = 'InvalidIdError';
  }
}
