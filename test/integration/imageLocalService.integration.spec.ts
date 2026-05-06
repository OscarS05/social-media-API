import { promises as fs } from 'fs';
import * as path from 'path';
import { ImageLocalService } from '../../src/shared/infrastructure/services/image-local.service';

describe('ImageLocalService (integration)', () => {
  let service: ImageLocalService;

  const uploadsDir = path.join(process.cwd(), 'uploads');

  beforeEach(async () => {
    service = new ImageLocalService();

    await fs.mkdir(uploadsDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(uploadsDir, {
      recursive: true,
      force: true,
    });
  });

  describe('.save()', () => {
    it('should save image physically', async () => {
      const buffer = Buffer.from('fake-image');

      const result = await service.save(buffer, 'avatar.jpg', 'avatars');

      const filePath = path.join(process.cwd(), result.replace(/^\/+/, ''));

      const exists = await fs.stat(filePath);

      expect(exists.isFile()).toBe(true);

      const content = await fs.readFile(filePath);

      expect(content.equals(buffer)).toBe(true);
    });
  });

  describe('.delete()', () => {
    it('should delete image physically', async () => {
      const filePath = path.join(uploadsDir, 'avatar.jpg');

      await fs.writeFile(filePath, 'fake');

      const result = await service.delete('/uploads/avatar.jpg');

      expect(result).toBe(true);

      await expect(fs.stat(filePath)).rejects.toThrow();
    });
  });
});
