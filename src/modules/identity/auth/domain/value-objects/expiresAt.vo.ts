import { InvalidExpiresAtError } from '../errors/refreshToken.errors';

export class ExpiresAtVO {
  constructor(private value: Date | string | number) {
    this.isValid();
  }

  public get(): Date {
    return this.value as Date;
  }

  private isValid(): boolean {
    try {
      if (!this.value) {
        throw new Error('Expiration date cannot be null');
      }

      const date = new Date(this.value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid expiration date');
      }

      const now = new Date();
      if (date.getTime() <= now.getTime()) {
        throw new Error('Expiration date must be in the future');
      }

      const maxExpiration = new Date();
      maxExpiration.setDate(now.getDate() + 30);
      if (date > maxExpiration) {
        throw new Error('Expiration date is too far in the future');
      }

      this.value = date;
      return true;
    } catch (error) {
      throw new InvalidExpiresAtError((error as Error).message);
    }
  }
}
