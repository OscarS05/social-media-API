import { InvalidNameError } from '../errors/errors';

export class NameVO {
  constructor(private readonly value: string) {
    this.value = value.trim();

    if (!this.isValid()) {
      throw new InvalidNameError();
    }
  }

  private isValid(): boolean {
    if (this.value.length < 6 || this.value.length > 30) {
      return false;
    }

    return this.validateCharacters();
  }

  private validateCharacters(): boolean {
    const validIdPattern = /^[a-zA-Z0-9_\s-]+$/;
    if (validIdPattern.test(this.value)) {
      return true;
    }

    return false;
  }

  public get(): string {
    return this.value;
  }
}
