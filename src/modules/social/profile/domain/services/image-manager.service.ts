export abstract class ImageManagerService {
  abstract saveImages(
    images: Array<{ buffer: Buffer; filename: string } | null>,
  ): Promise<Array<string | null>>;

  abstract deleteImages(paths: Array<string | null>): Promise<void>;
}
