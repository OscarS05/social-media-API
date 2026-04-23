import { PathVO } from '../value-objects/path.vo';

export abstract class ImageStoragePort {
  abstract save(file: Buffer, filename: string): Promise<PathVO>;
}
