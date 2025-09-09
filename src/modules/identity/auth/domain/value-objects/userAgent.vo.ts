import { InvalidUserAgentError } from '../errors/refreshToken.errors';

export class UserAgentVO {
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
        throw new Error('UserAgent cannot be empty');
      }

      if (this.value.length > 500) {
        throw new Error('UserAgent is too long');
      }

      const regex = /^[a-zA-Z0-9\s\-._();:.,/]+$/;
      if (!regex.test(this.value)) {
        throw new Error('UserAgent contains invalid characters');
      }

      return true;
    } catch (error) {
      throw new InvalidUserAgentError((error as Error).message);
    }
  }
}
