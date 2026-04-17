import { InvalidEmailError } from '../errors/auth.errors';

export class EmailVO {
  constructor(private readonly value: string) {
    this.value = value.toLowerCase().trim();

    if (!this.isValid(this.value)) {
      throw new InvalidEmailError();
    }
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  public get(): string {
    return this.value;
  }
}
