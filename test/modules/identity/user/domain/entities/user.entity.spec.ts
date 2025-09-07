import { UserEntity } from '../../../../../../src/modules/identity/users/domain/entities/user.entity';
import { Roles } from '../../../../../../src/modules/identity/users/domain/entities/roles.enum';

describe('User Entity', () => {
  let user: UserEntity;
  const id = 'd883878e-16cf-47f4-87b3-670566abe41e';
  const name = 'userId123';
  const role = Roles.MEMBER;
  const now: Date = new Date();

  beforeEach(() => {
    user = new UserEntity(id, name, role, now, now, null);
  });

  it('should create a user with valid data', () => {
    expect(user.id).toBe(id);
    expect(user.name).toBe(name);
    expect(user.role).toBe(role);
    expect(user.createdAt).toBe(now);
    expect(user.updatedAt).toBe(now);
    expect(user.deletedAt).toBe(null);
  });
});
