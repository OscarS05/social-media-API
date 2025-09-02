import { IUuidService } from '../../../../../../src/modules/identity/auth/domain/services/uuid.service';
import { AuthIdVO } from '../../../../../../src/modules/identity/auth/domain/entities/authId.value-object';

describe('AuthIdVO', () => {
  const mockResult = 'mocked-uuid';
  let uuidServiceMock: IUuidService;
  let authIdVO: AuthIdVO;

  beforeEach(() => {
    uuidServiceMock = {
      generateId: jest.fn().mockReturnValue(mockResult),
    };
    authIdVO = new AuthIdVO(uuidServiceMock);
  });

  it('should generate an id using the uuidService', () => {
    const result = authIdVO.generateId();

    expect(uuidServiceMock.generateId).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockResult);
  });
});
