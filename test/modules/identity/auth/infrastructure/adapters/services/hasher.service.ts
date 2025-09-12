import { IHasherService } from '../../../../../../../src/modules/identity/auth/domain/services/password-hasher.service';

export class IHasherServiceMock implements IHasherService {
  hash = jest.fn();
  compare = jest.fn();
}
