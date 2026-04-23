import { ImageStoragePort } from '../../../../../../src/modules/social/profile/domain/services/image.service';

export class MockImageStorage extends ImageStoragePort {
  save = jest.fn();
  delete = jest.fn();
}
