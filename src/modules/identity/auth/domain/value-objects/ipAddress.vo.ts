import { InvalidIPAddressError } from '../errors/refreshToken.errors';

export class IPAddressVO {
  constructor(private readonly value: string) {
    this.value = value.trim();
    this.isValid();
  }

  public get(): string {
    return this.value;
  }

  private isValid(): boolean {
    try {
      if (!this.value || this.value.length === 0) {
        throw new Error('IP address cannot be empty');
      }

      if (this.value.length > 39) {
        throw new Error('IP address is too long');
      }

      const ipv4Regex =
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/;

      const ipv6Regex = /^(([0-9a-fA-F]{1,4}):){7}([0-9a-fA-F]{1,4})$/;

      if (!ipv4Regex.test(this.value) && !ipv6Regex.test(this.value)) {
        throw new Error('Invalid IP address format');
      }

      return true;
    } catch (error) {
      throw new InvalidIPAddressError((error as Error).message);
    }
  }
}
