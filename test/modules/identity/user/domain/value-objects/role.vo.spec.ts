import { InvalidRoleError } from '../../../../../../src/modules/identity/users/domain/errors/errors';
import { RoleVO } from '../../../../../../src/modules/identity/users/domain/value-objects/role.vo';

describe('User Entity', () => {
  const emptyRole = '';
  const invalidRole = 'user';
  const correctRole = 'member';

  it('should not throw an error because the role is correct', () => {
    expect(new RoleVO(correctRole).get()).toBe(correctRole);
  });

  it('should throw an error because the role is empty', () => {
    expect(() => new RoleVO(emptyRole)).toThrow(InvalidRoleError);
  });

  it('should throw an error because the role is invalid', () => {
    expect(() => new RoleVO(invalidRole)).toThrow(InvalidRoleError);
  });
});
