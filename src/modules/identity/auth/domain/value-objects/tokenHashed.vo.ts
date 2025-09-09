import { InvalidTokenError } from '../errors/refreshToken.errors';

export class TokenHashedVO {
  constructor(private readonly value: string) {
    this.value = value.trim();
    this.isValid();
  }

  public get(): string {
    return this.value;
  }

  private isValid(): boolean {
    try {
      if (!this.value || this.value.length === 0) {
        throw new Error('Token is empty');
      }

      if (
        !this.value.startsWith('$2a$') &&
        !this.value.startsWith('$2b$') &&
        !this.value.startsWith('$2y$')
      ) {
        throw new Error('Token is not a hash');
      }

      // 60 is the length of bcrypt hashes
      if (this.value.length !== 60) {
        throw new Error('Token has an invalid length');
      }

      return true;
    } catch (error) {
      throw new InvalidTokenError((error as Error).message);
    }
  }
}
