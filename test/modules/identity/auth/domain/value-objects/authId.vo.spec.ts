import { InvalidIdError } from '../../../../../../src/modules/identity/auth/domain/errors/errors';
import { AuthIdVO } from '../../../../../../src/modules/identity/auth/domain/value-objects/authId.vo';

describe('AuthIdVO', () => {
  const correctId = '10346550-dfaa-4b2f-add6-21743b37db10';
  const wrongIdByLength = 'mocked-uuid';
  const wrongIdByBadHyphen = '-mocked-uuid-';
  const wrongIdByInvalidCharacters = 'SELECT * FROM refresh_tokens;';

  it('should throw an error because the id have not the length', () => {
    expect(() => new AuthIdVO(wrongIdByLength).get()).toThrow(InvalidIdError);
  });

  it('should throw an error because the id have wrong the hyphen', () => {
    expect(() => new AuthIdVO(wrongIdByBadHyphen).get()).toThrow(InvalidIdError);
  });

  it('should throw an error because the id have invalid characters', () => {
    expect(() => new AuthIdVO(wrongIdByInvalidCharacters).get()).toThrow(InvalidIdError);
  });

  it('should not throw an error because the id is correct', () => {
    expect(new AuthIdVO(correctId).get()).toBe(correctId);
  });
});
