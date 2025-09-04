import { InvalidIdError } from '../errors/errors';

export class UserIdVO {
  constructor(private readonly value: string) {
    if (!this.isValid()) {
      throw new InvalidIdError();
    }
  }

  public get(): string {
    return this.value.trim();
  }

  private isValid(): boolean {
    const trimmedValue = this.value.trim();
    if (!this.validateLength(trimmedValue)) {
      return false;
    }

    if (!this.validateCharacterrs(trimmedValue)) {
      return false;
    }

    if (!this.validateInitFinal(trimmedValue)) {
      return false;
    }

    return true;
  }

  private validateLength(trimmedValue: string): boolean {
    if (!this.value || trimmedValue === '' || trimmedValue.length !== 36) {
      return false;
    }

    return true;
  }

  private validateCharacterrs(trimmedValue: string): boolean {
    const validIdPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validIdPattern.test(trimmedValue)) {
      return false;
    }

    return true;
  }

  private validateInitFinal(trimmedValue: string): boolean {
    if (
      trimmedValue.startsWith('-') ||
      trimmedValue.startsWith('_') ||
      trimmedValue.endsWith('-') ||
      trimmedValue.endsWith('_')
    ) {
      return false;
    }

    return true;
  }
}
