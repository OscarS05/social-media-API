import { UrlVO } from '../value-objects/url.vo';

export abstract class ImageStoragePort {
  abstract save(file: Buffer, filename: string): Promise<UrlVO>;
}
