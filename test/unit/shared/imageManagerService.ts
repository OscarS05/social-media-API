import { ImageManagerService } from '../../../src/shared/infrastructure/services/image-manager.service';

export class MockImageManagerService extends ImageManagerService {
  saveImages = jest.fn();
  deleteImages = jest.fn();
}
