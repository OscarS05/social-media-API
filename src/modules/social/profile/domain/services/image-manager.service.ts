import { Folder } from '../../../../../shared/domain/services/image.service';

export abstract class ImageManagerService {
  abstract saveImages(
    images: Array<{ buffer: Buffer; filename: string; folder: Folder } | null>,
  ): Promise<Array<string | null>>;

  abstract deleteImages(paths: Array<string | null>): Promise<void>;
}
