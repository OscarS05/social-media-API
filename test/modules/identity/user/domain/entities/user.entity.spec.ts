import { UserEntity } from '../../../../../../src/modules/identity/users/domain/entities/user.entity';
import { Roles } from '../../../../../../src/modules/identity/users/domain/entities/roles.enum';

describe('User Entity', () => {
  let user: UserEntity;
  const id = 'id123';
  const name = 'userId123';
  const role = Roles.MEMBER;
  const now: Date = new Date();

  beforeEach(() => {
    user = new UserEntity(id, name, role, now, now, null);
  });

  it('should create a user with valid data', () => {
    expect(user.id).toBe('id123');
    expect(user.name).toBe('userId123');
    expect(user.role).toBe('member');
    expect(user.createdAt).toBe(now);
    expect(user.updatedAt).toBe(now);
    expect(user.deletedAt).toBe(null);
  });
});
