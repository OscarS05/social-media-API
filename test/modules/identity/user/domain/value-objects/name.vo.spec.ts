import { InvalidNameError } from '../../../../../../src/modules/identity/users/domain/errors/errors';
import { NameVO } from '../../../../../../src/modules/identity/users/domain/value-objects/name.vo';

describe('User Entity', () => {
  const longName = '10346550-dfaa-4b2f-add6-21743b37db10';
  const shortName = 'abc';
  const invalidName = 'SELECT * FROM auth;';
  const correctName = 'Test Admin';

  it('should not throw an error because the name is correct', () => {
    expect(new NameVO(correctName).get()).toBe(correctName);
  });

  it('should throw an error because the name is too long', () => {
    expect(() => new NameVO(longName)).toThrow(InvalidNameError);
  });

  it('should throw an error because the name is too short', () => {
    expect(() => new NameVO(shortName)).toThrow(InvalidNameError);
  });

  it('should throw an exception because name is invalid', () => {
    expect(() => new NameVO(invalidName)).toThrow(InvalidNameError);
  });
});
