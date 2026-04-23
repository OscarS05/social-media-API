import { InvalidUsernameError } from '../errors/profile.errors';

export class UsernameVO {
  constructor(private readonly value: string) {
    this.value = value;
  }

  static create(value: string) {
    const trimmed = value.trim();
    if (trimmed.length < 3 || trimmed.length > 50) {
      throw new InvalidUsernameError('Invalid length');
    }

    const validChars = /^[a-zA-Z0-9._]+$/;
    if (!validChars.test(trimmed)) {
      throw new InvalidUsernameError('Invalid chars');
    }

    if (/^[._]|[._]$/.test(trimmed)) {
      throw new InvalidUsernameError('Invalid format');
    }

    if (trimmed.includes('..') || trimmed.includes('__')) {
      throw new InvalidUsernameError('Invalid format');
    }

    return new UsernameVO(trimmed);
  }

  get(): string {
    return this.value;
  }
}
