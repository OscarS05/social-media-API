import { UuidService } from '../../../../../../src/modules/auth/domain/services/uuid.service';

export class MockUuidService extends UuidService {
  generate = jest.fn();
}
