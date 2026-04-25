import { Injectable, Logger } from '@nestjs/common';
import { ImageStoragePort } from '../../domain/services/image.service';

@Injectable()
export class ImageManagerService {
  private readonly logger = new Logger(ImageManagerService.name);

  constructor(private readonly imageStorage: ImageStoragePort) {}

  async saveImages(
    images: Array<{ buffer: Buffer; filename: string } | null>,
  ): Promise<Array<string | null>> {
    const results = await Promise.allSettled(
      images.map((img) =>
        img?.buffer ? this.imageStorage.save(img.buffer, img.filename) : Promise.resolve(null),
      ),
    );

    const saved: Array<string | null> = [];
    const toRollback: string[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        saved.push(result.value);
        if (result.value) toRollback.push(result.value);
      } else {
        saved.push(null);
      }
    }

    const hasFailure = results.some((r) => r.status === 'rejected');
    if (hasFailure) {
      await this.rollback(toRollback);
      const reason = results.find((r) => r.status === 'rejected') as PromiseRejectedResult;
      throw reason.reason;
    }

    return saved;
  }

  async deleteImages(paths: Array<string | null>): Promise<void> {
    const results = await Promise.allSettled(
      paths.map((path) => (path ? this.imageStorage.delete(path) : Promise.resolve(null))),
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(`Failed to delete image at path: ${paths[index]}`, result.reason);
      }
    });
  }

  private async rollback(paths: string[]): Promise<void> {
    const results = await Promise.allSettled(
      paths.map((path) => this.imageStorage.delete(path)),
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(`Rollback failed for image: ${paths[index]}`, result.reason);
      }
    });
  }
}
