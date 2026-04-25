import { Test, TestingModule } from '@nestjs/testing';
import { ImageManagerService } from '../../../src/shared/infrastructure/services/image-manager.service';
import { MockImageStorage } from '../social/profile/infrastructure/services/image.service-mock';
import { ImageStoragePort } from '../../../src/shared/domain/services/image.service';
import { AVATAR_URL, avatarData, COVER_URL, coverData } from '../../factories/profile.factory';

describe('ImageManagerService', () => {
  let service: ImageManagerService;
  const imageStorage = new MockImageStorage();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: ImageStoragePort, useValue: imageStorage }, ImageManagerService],
    }).compile();

    service = module.get<ImageManagerService>(ImageManagerService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // === SUCCESSFUL ===

  it('should save all images successfully', async () => {
    imageStorage.save.mockResolvedValueOnce(AVATAR_URL).mockResolvedValueOnce(COVER_URL);

    const result = await service.saveImages([avatarData, coverData]);

    expect(imageStorage.save).toHaveBeenCalledTimes(2);
    expect(result).toStrictEqual([AVATAR_URL, COVER_URL]);
  });

  it('should handle null images correctly', async () => {
    const result = await service.saveImages([null, null]);

    expect(imageStorage.save).not.toHaveBeenCalled();
    expect(result).toStrictEqual([null, null]);
  });

  it('should mix null and valid images', async () => {
    imageStorage.save.mockResolvedValueOnce(AVATAR_URL);

    const result = await service.saveImages([avatarData, null]);

    expect(imageStorage.save).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual([AVATAR_URL, null]);
  });

  // === FAILS ===

  it('should rollback successfully saved images if one fails', async () => {
    imageStorage.save
      .mockResolvedValueOnce(AVATAR_URL)
      .mockRejectedValueOnce(new Error('fail'));

    imageStorage.delete.mockResolvedValueOnce(true);

    await expect(service.saveImages([avatarData, coverData])).rejects.toThrow('fail');

    expect(imageStorage.save).toHaveBeenCalledTimes(2);
    expect(imageStorage.delete).toHaveBeenCalledTimes(1);
    expect(imageStorage.delete).toHaveBeenCalledWith(AVATAR_URL);
  });

  it('should attempt rollback even if multiple saves succeeded before failure', async () => {
    imageStorage.save
      .mockResolvedValueOnce(AVATAR_URL)
      .mockResolvedValueOnce(COVER_URL)
      .mockRejectedValueOnce(new Error('fail'));

    imageStorage.delete.mockResolvedValueOnce(true).mockResolvedValueOnce(true);

    await expect(service.saveImages([avatarData, coverData, avatarData])).rejects.toThrow(
      'fail',
    );

    expect(imageStorage.delete).toHaveBeenCalledTimes(2);
    expect(imageStorage.delete).toHaveBeenCalledWith(AVATAR_URL);
    expect(imageStorage.delete).toHaveBeenCalledWith(COVER_URL);
  });

  it('should log error if rollback fails', async () => {
    const loggerSpy = jest.spyOn<any, any>(service['logger'], 'error');

    imageStorage.save
      .mockResolvedValueOnce(AVATAR_URL)
      .mockRejectedValueOnce(new Error('fail'));

    imageStorage.delete.mockRejectedValueOnce(new Error('rollback fail'));

    await expect(service.saveImages([avatarData, coverData])).rejects.toThrow('fail');

    expect(loggerSpy).toHaveBeenCalledTimes(1);
  });

  it('should delete all images successfully', async () => {
    imageStorage.delete.mockResolvedValueOnce(true).mockResolvedValueOnce(true);

    await service.deleteImages([AVATAR_URL, COVER_URL]);

    expect(imageStorage.delete).toHaveBeenCalledTimes(2);
  });

  it('should ignore null paths', async () => {
    await service.deleteImages([null, null]);

    expect(imageStorage.delete).not.toHaveBeenCalled();
  });

  it('should log error if delete fails', async () => {
    const loggerSpy = jest.spyOn<any, any>(service['logger'], 'error');

    imageStorage.delete.mockRejectedValueOnce(new Error('delete fail'));

    await service.deleteImages([AVATAR_URL]);

    expect(imageStorage.delete).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenCalledTimes(1);
  });
});
