import { IUuidService } from '../../../../../../../src/modules/identity/auth/domain/services/uuid.service';

export class IUuidServiceMock implements IUuidService {
  generateId = jest.fn();
}
