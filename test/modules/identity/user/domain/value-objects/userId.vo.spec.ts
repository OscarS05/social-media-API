import { InvalidIdError } from '../../../../../../src/modules/identity/users/domain/errors/errors';
import { UserIdVO } from '../../../../../../src/modules/identity/users/domain/value-objects/userId.vo';

describe('User Entity', () => {
  const correctId = '10346550-dfaa-4b2f-add6-21743b37db10';
  const wrongId = 'abc123';
  const emptyId = '';

  it('should not throw an error because the id is correct', () => {
    expect(new UserIdVO(correctId).get()).toBe(correctId);
  });

  it('should throw an error because the id is empty', () => {
    expect(() => new UserIdVO(emptyId)).toThrow(InvalidIdError);
  });

  it('should throw an exception because id is invalid', () => {
    expect(() => new UserIdVO(wrongId)).toThrow(InvalidIdError);
  });
});
