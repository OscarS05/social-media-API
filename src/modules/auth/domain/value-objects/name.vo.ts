import { InvalidNameError } from '../errors/user.errors';

const REAL_NAME_PATTERN = /^[\p{L}\p{M}' -]+$/u;

export class NameVO {
  private readonly value: string;

  constructor(value: string) {
    this.value = value.trim().replace(/\s+/g, ' ');

    if (!this.isValid()) {
      throw new InvalidNameError();
    }
  }

  private isValid(): boolean {
    if (this.value.length < 2 || this.value.length > 50) {
      return false;
    }

    if (!REAL_NAME_PATTERN.test(this.value)) {
      return false;
    }

    if (/^[' -]|[' -]$/.test(this.value)) {
      return false;
    }

    return true;
  }

  get(): string {
    return this.value;
  }
}
