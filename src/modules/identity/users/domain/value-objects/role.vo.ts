import { Roles } from '../entities/roles.enum';
import { InvalidRoleError } from '../errors/errors';

export class RoleVO {
  constructor(private readonly value: string) {
    this.value = value.toLowerCase().trim();

    if (!this.isValid(this.value)) {
      throw new InvalidRoleError();
    }
  }

  private isValid(role: string): boolean {
    return Object.values(Roles).includes(role as Roles);
  }

  public get(): Roles {
    return this.value as Roles;
  }
}
