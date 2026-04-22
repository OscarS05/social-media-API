import { InvalidUrlError } from '../errors/profile.errors';

export class UrlVO {
  constructor(private readonly value: URL) {
    this.value = value;
  }

  static create(value: string): UrlVO {
    let url: URL;

    try {
      url = new URL(value.trim());
    } catch (error) {
      throw new InvalidUrlError(error as string);
    }

    if (!['https:'].includes(url.protocol)) {
      throw new InvalidUrlError('Invalid protocol');
    }

    if (!url.hostname) {
      throw new InvalidUrlError('Invalid hostname');
    }

    return new UrlVO(url);
  }

  get(): string {
    return this.value.toString();
  }
}
