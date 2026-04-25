export class InvalidIdFoundError extends Error {
  constructor(message?: string | null) {
    super(message || 'Invalid ID');
    this.name = 'InvalidIdError';
  }
}

export class InvalidUsernameError extends Error {
  constructor(message?: string | null) {
    super(message || 'Invalid username');
    this.name = 'InvalidUsernameError';
  }
}

export class InvalidUrlError extends Error {
  constructor(message?: string | null) {
    super(message || 'Invalid URL');
    this.name = 'InvalidUrlError';
  }
}

export class InvalidBioError extends Error {
  constructor(message?: string | null) {
    super(message || 'Invalid biography');
    this.name = 'InvalidBioError';
  }
}

export class InvalidPathError extends Error {
  constructor(message?: string | null) {
    super(message || 'Invalid path');
    this.name = 'InvalidPathError';
  }
}

export class InvalidProfileError extends Error {
  constructor(message?: string | null) {
    super(message || 'Invalid profile');
    this.name = 'InvalidProfileError';
  }
}

export class InternalServerError extends Error {
  constructor(message?: string | null) {
    super(message || 'Internal server error');
    this.name = 'InternalServerError';
  }
}

export class UsernameAlreadyInUseError extends Error {
  constructor(message?: string | null) {
    super(message || 'Username already in use');
    this.name = 'UsernameAlreadyInUseError';
  }
}

export class UniqueViolationError extends Error {
  constructor(message?: string | null) {
    super(message || 'UserName already in use');
    this.name = 'UniqueViolationError';
  }
}

export class DomainNotFoundError extends Error {
  constructor(message?: string | null) {
    super(message || 'Profile not found');
    this.name = 'NotFoundError';
  }
}
