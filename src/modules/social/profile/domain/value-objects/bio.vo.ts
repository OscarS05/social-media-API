import { InvalidBioError } from '../errors/profile.errors';

export class BioVO {
  private static readonly MAX_LENGTH = 280;

  constructor(private readonly value: string | null) {}

  static create(input: string): BioVO {
    const value = input.trim();

    if (!value || value.length === 0) return new BioVO(null);
    this.isValid(value);
    return new BioVO(value);
  }

  private static isValid(value: string): void {
    if (value.length > this.MAX_LENGTH) {
      throw new InvalidBioError('Invalid length');
    }
  }

  get(): string | null {
    return this.value;
  }
}
