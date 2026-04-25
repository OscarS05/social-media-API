export abstract class ImageStoragePort {
  abstract save(file: Buffer, filename: string): Promise<string>;
  abstract delete(path: string): Promise<boolean>;
}
