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
