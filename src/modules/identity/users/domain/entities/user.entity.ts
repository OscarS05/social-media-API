import { NameVO } from '../value-objects/name.vo';
import { RoleVO } from '../value-objects/role.vo';
import { UserIdVO } from '../value-objects/userId.vo';

export class UserEntity {
  constructor(
    public id: string,
    public name: string,
    public role: string,
    public createdAt?: Date,
    public updatedAt?: Date,
    public deletedAt?: Date | null,
  ) {
    this.id = new UserIdVO(id).get();
    this.name = new NameVO(name).get();
    this.role = new RoleVO(role).get();
  }
}
