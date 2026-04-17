import { InvalidPasswordError } from '../errors/auth.errors';

export class PlainPasswordVO {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value.trim();
  }

  static create(value: string): PlainPasswordVO {
    const vo = new PlainPasswordVO(value);
    vo.validate();
    return vo;
  }

  private validate(): void {
    if (!this.hasValidLength()) throw new InvalidPasswordError();
    if (!this.hasComplexity()) throw new InvalidPasswordError();
  }

  private hasValidLength(): boolean {
    return this.value.length >= 8 && this.value.length <= 36;
  }

  private hasComplexity(): boolean {
    return (
      /[A-Z]/.test(this.value) &&
      /[0-9]/.test(this.value) &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(this.value)
    );
  }

  get(): string {
    return this.value;
  }
}
