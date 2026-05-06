import { Injectable } from '@nestjs/common';

import { promises as fs } from 'node:fs';
import path from 'node:path';

import { Folder, ImageStoragePort } from '../../domain/services/image.service';

@Injectable()
export class ImageLocalService implements ImageStoragePort {
  private readonly UPLOAD_FOLDER = 'uploads';
  private readonly uploadDir = path.join(process.cwd(), this.UPLOAD_FOLDER);

  async save(file: Buffer, origFilename: string, folder: Folder): Promise<string> {
    await this.ensureUploadDirExists(folder);
    const filename = this.generateFilename(origFilename);
    const filePath = path.join(this.uploadDir, folder, filename);

    await fs.writeFile(filePath, file);

    return `/${this.UPLOAD_FOLDER}/${folder}/${filename}`;
  }

  async delete(filePath: string): Promise<boolean> {
    try {
      const normalizedPath = path.join(process.cwd(), filePath.replace(/^\/+/, ''));

      await fs.unlink(normalizedPath);

      return true;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return false;
      }

      throw error;
    }
  }

  private async ensureUploadDirExists(folder: Folder): Promise<void> {
    await fs.mkdir(path.join(this.uploadDir, folder), { recursive: true });
  }

  private generateFilename(original: string): string {
    const ext = path.extname(original).toLowerCase();
    return `${crypto.randomUUID()}${ext}`;
  }
}
