import { promises as fs } from 'fs';
import { ImageLocalService } from '../../../src/shared/infrastructure/services/image-local.service';

jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    unlink: jest.fn(),
  },
}));

describe('ImageLocalService', () => {
  let service: ImageLocalService;
  const fakeImage = 'fake-image';
  const fakeFilename = 'avatar.jpg';

  beforeEach(() => {
    service = new ImageLocalService();

    jest.clearAllMocks();
  });

  describe('.save()', () => {
    it('should save image successfully', async () => {
      const buffer = Buffer.from(fakeImage);

      const result = await service.save(buffer, fakeFilename);

      expect(fs.mkdir).toHaveBeenCalledTimes(1);

      expect(fs.writeFile).toHaveBeenCalledWith(expect.stringContaining('uploads'), buffer);

      expect(result).toBe('/uploads/avatar.jpg');
    });

    it('should throw if writeFile fails', async () => {
      (fs.writeFile as jest.Mock).mockRejectedValue(new Error('disk fail'));

      const buffer = Buffer.from(fakeImage);

      await expect(service.save(buffer, fakeFilename)).rejects.toThrow('disk fail');
    });
  });

  describe('.delete()', () => {
    it('should delete image successfully', async () => {
      const result = await service.delete('/uploads/avatar.jpg');

      expect(fs.unlink).toHaveBeenCalledTimes(1);

      expect(result).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      (fs.unlink as jest.Mock).mockRejectedValue({
        code: 'ENOENT',
      });

      const result = await service.delete('/uploads/missing.jpg');

      expect(result).toBe(false);
    });

    it('should throw unexpected errors', async () => {
      (fs.unlink as jest.Mock).mockRejectedValue(new Error('permission denied'));

      await expect(service.delete('/uploads/avatar.jpg')).rejects.toThrow('permission denied');
    });
  });
});
