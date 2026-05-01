import { ImageStoragePort } from '../../../../../../src/shared/domain/services/image.service';

export class MockImageStorage extends ImageStoragePort {
  save = jest.fn();
  delete = jest.fn();
}
