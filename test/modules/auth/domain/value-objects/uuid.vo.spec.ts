import { InvalidIdError } from '../../../../../src/modules/auth/domain/errors/user.errors';
import { uuidVO } from '../../../../../src/modules/auth/domain/value-objects/uuidVO';

describe('uuidVO', () => {
  const validUuid = '10346550-dfaa-4b2f-9d84-0f54bdc65f10';

  it('should create a uuidVO with a valid UUID v4', () => {
    const vo = new uuidVO(validUuid);

    expect(vo).toBeInstanceOf(uuidVO);
    expect(vo.get()).toBe(validUuid);
  });

  it('should trim whitespace around the UUID', () => {
    const vo = new uuidVO(`  ${validUuid}  `);

    expect(vo.get()).toBe(validUuid);
  });

  it('should throw InvalidIdError for an invalid UUID format', () => {
    expect(() => new uuidVO('invalid-uuid')).toThrow(InvalidIdError);
  });

  it('should throw InvalidIdError for a UUID without hyphens', () => {
    expect(() => new uuidVO('10346550dfaa4b2f4d8491790f54bdc65f10')).toThrow(InvalidIdError);
  });

  it('should throw InvalidIdError for a UUID with the wrong version', () => {
    expect(() => new uuidVO('10346550-dfaa-4b2f-2d84-9179-0f54bdc65f10')).toThrow(
      InvalidIdError,
    );
  });

  it('should throw InvalidIdError for a UUID with an invalid variant', () => {
    expect(() => new uuidVO('10346550-dfaa-4b2f-0d84-9179-0f54bdc65f10')).toThrow(
      InvalidIdError,
    );
  });
});
