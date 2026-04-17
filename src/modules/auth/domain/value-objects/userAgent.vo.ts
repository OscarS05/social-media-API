import { InvalidUserAgentError } from '../errors/session.errors';
import { UserAgentParsed } from '../services/userAgent.service';

export class UserAgentVO {
  private readonly value: UserAgentParsed;

  private constructor(value: UserAgentParsed) {
    this.value = value;
  }

  static create(value: UserAgentParsed): UserAgentVO {
    if (!value) throw new InvalidUserAgentError('UserAgent cannot be empty');
    if (!value.browser?.name) throw new InvalidUserAgentError('Browser name is required');
    if (!value.os?.name) throw new InvalidUserAgentError('OS name is required');

    return new UserAgentVO(value);
  }

  get(): UserAgentParsed {
    return this.value;
  }

  getBrowserInfo(): string {
    const { name, version } = this.value.browser;
    return version ? `${name} ${version}` : name;
  }

  getOsInfo(): string {
    const { name, version } = this.value.os;
    return version ? `${name} ${version}` : name;
  }

  toDisplay(): string {
    return `${this.getBrowserInfo()} en ${this.getOsInfo()}`;
  }
}
