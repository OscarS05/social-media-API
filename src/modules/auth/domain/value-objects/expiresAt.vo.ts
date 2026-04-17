import { InvalidExpiresAtError } from '../errors/session.errors';

export class ExpiresAtVO {
  private readonly value: Date;

  private constructor(value: Date) {
    this.value = value;
  }

  static create(input: Date | string | number): ExpiresAtVO {
    const date = new Date(input);

    if (!input) throw new InvalidExpiresAtError('Expiration date cannot be null');
    if (isNaN(date.getTime())) throw new InvalidExpiresAtError('Invalid expiration date');
    if (date.getTime() <= Date.now())
      throw new InvalidExpiresAtError('Expiration date must be in the future');

    const maxExpiration = new Date();
    maxExpiration.setDate(maxExpiration.getDate() + 30);
    if (date > maxExpiration)
      throw new InvalidExpiresAtError('Expiration date is too far in the future');

    return new ExpiresAtVO(date);
  }

  get(): Date {
    return this.value;
  }
}
