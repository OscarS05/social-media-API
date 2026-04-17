import { InvalidHashError } from '../errors/auth.errors';

const BCRYPT_PREFIXES = ['$2b$', '$2a$', '$2y$'];
const BCRYPT_LENGTH = 60;

export class BcryptHashVO {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): BcryptHashVO {
    const trimmed = value?.trim();

    if (!trimmed) {
      throw new InvalidHashError('Hash cannot be empty');
    }
    if (!BCRYPT_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) {
      throw new InvalidHashError('Value is not a bcrypt hash');
    }
    if (trimmed.length !== BCRYPT_LENGTH) {
      throw new InvalidHashError('Hash has invalid length');
    }

    return new BcryptHashVO(trimmed);
  }

  get(): string {
    return this.value;
  }
}
