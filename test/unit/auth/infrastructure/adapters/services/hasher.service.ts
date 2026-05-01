import { HasherService } from '../../../../../../src/modules/auth/domain/services/hasher.service';

export class MockHasherService extends HasherService {
  hash = jest.fn();
  compare = jest.fn();
}
