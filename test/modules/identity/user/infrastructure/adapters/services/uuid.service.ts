import { NodeUuidService } from 'src/modules/identity/users/infrastructure/services/uuid.service';

export class UuidServiceMock implements NodeUuidService {
  generateId = jest.fn();
}
