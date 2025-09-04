import { NameVO } from '../value-objects/name.vo';
import { RoleVO } from '../value-objects/role.vo';
import { UserIdVO } from '../value-objects/userId.vo';
import { Roles } from './roles.enum';

export class UserEntity {
  constructor(
    public id: string = new UserIdVO(id).get(),
    public name: string = new NameVO(name).get(),
    public role: Roles = new RoleVO(role).get(),
    public createdAt?: Date,
    public updatedAt?: Date,
    public deletedAt?: Date | null,
  ) {}
}
