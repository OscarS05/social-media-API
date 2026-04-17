import { InvalidIdError } from '../errors/user.errors';

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class uuidVO {
  private readonly value: string;

  constructor(value: string) {
    this.value = value.trim();

    if (!UUID_V4_PATTERN.test(this.value)) {
      throw new InvalidIdError('Invalid UUID format');
    }
  }

  get(): string {
    return this.value;
  }
}
