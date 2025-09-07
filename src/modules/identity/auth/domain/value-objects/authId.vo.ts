import { InvalidIdError } from '../errors/errors';

export class AuthIdVO {
  constructor(private readonly value: string) {
    this.value = value.trim();
    if (!this.isValid()) {
      throw new InvalidIdError();
    }
  }

  public get(): string {
    return this.value;
  }

  private isValid(): boolean {
    if (!this.validateLength()) {
      return false;
    }

    if (!this.validateCharacterrs()) {
      return false;
    }

    if (!this.validateInitFinal()) {
      return false;
    }

    return true;
  }

  private validateLength(): boolean {
    if (!this.value || this.value === '' || this.value.length !== 36) {
      return false;
    }

    return true;
  }

  private validateCharacterrs(): boolean {
    const validIdPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validIdPattern.test(this.value)) {
      return false;
    }

    return true;
  }

  private validateInitFinal(): boolean {
    if (
      this.value.startsWith('-') ||
      this.value.startsWith('_') ||
      this.value.endsWith('-') ||
      this.value.endsWith('_')
    ) {
      return false;
    }

    return true;
  }
}
