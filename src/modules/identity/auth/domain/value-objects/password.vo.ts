import { InvalidPasswordError } from '../errors/errors';

export class PasswordVO {
  constructor(private readonly value: string) {
    this.value = value.trim();
  }

  public get(): string {
    return this.value;
  }

  public isEncrypted(): string {
    if (
      (this.value && this.value !== '' && this.value.startsWith('$2b$')) ||
      this.value.startsWith('$2a$')
    ) {
      return this.value;
    }

    throw new InvalidPasswordError();
  }

  public isValidPlainPass(): string {
    if (this.validateLength() && this.validateComplexity()) {
      return this.value;
    }

    throw new InvalidPasswordError();
  }

  private validateLength(): boolean {
    if (
      !this.value ||
      this.value === '' ||
      this.value.length < 8 ||
      this.value.length > 36
    ) {
      return false;
    }

    return true;
  }

  private validateComplexity(): boolean {
    const hasUpperCase = /[A-Z]/.test(this.value);
    const hasNumber = /[0-9]/.test(this.value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(this.value);

    return hasUpperCase && hasNumber && hasSpecialChar;
  }
}
