import { Test, TestingModule } from '@nestjs/testing';
import { CreateProfileUseCase } from '../../../../../../src/modules/social/profile/application/use-cases/create-profile.usecase';
import { ProfileRepository } from '../../../../../../src/modules/social/profile/domain/repositories/profile.repository';
import {
  InvalidPathError,
  UniqueViolationError,
} from '../../../../../../src/modules/social/profile/domain/errors/profile.errors';
import { MockProfileRepository } from '../../infrastructure/repositories/profile.repository-mock';
import { MockImageStorage } from '../../infrastructure/services/image.service-mock';
import { ProfileEntity } from '../../../../../../src/modules/social/profile/domain/entities/profile.entity';
import {
  avatarData,
  buildProfileEntity,
  coverData,
  NEW_AVATAR_URL,
  NEW_COVER_URL,
} from '../../../../../factories/profile.factory';
import { ProfileBasic } from '../../../../../../src/modules/social/profile/domain/types/profile';
import { ImageManagerService } from '../../../../../../src/modules/social/profile/domain/services/image-manager.service';
import { MockImageManagerService } from '../../../../shared/imageManagerService';

describe('CreateProfileUseCase', () => {
  let usecase: CreateProfileUseCase;
  const profileRepository = new MockProfileRepository();
  const imageService = new MockImageStorage();
  const imageManager = new MockImageManagerService(imageService);

  const profileData: ProfileEntity = buildProfileEntity();
  const profileBasic: ProfileBasic = profileData.toBasic();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ProfileRepository, useValue: profileRepository },
        { provide: ImageManagerService, useValue: imageManager },
        CreateProfileUseCase,
      ],
    }).compile();

    usecase = module.get<CreateProfileUseCase>(CreateProfileUseCase);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    profileRepository.findByUserId.mockResolvedValue(null);
    profileRepository.findByUserName.mockResolvedValue(null);
    profileRepository.create.mockResolvedValue(buildProfileEntity());
    profileRepository.delete.mockResolvedValue(undefined);
  });

  // === SUCCESSFUL ===

  it('should create a profile without images', async () => {
    imageManager.saveImages.mockResolvedValue([null, null]);

    const result = await usecase.execute(profileBasic);

    expect(profileRepository.findByUserId).toHaveBeenCalledWith(profileData.userId);
    expect(profileRepository.findByUserName).toHaveBeenCalledWith(profileData.username);
    expect(profileRepository.create).toHaveBeenCalledTimes(1);
    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(imageManager.saveImages).toHaveBeenCalledWith([null, null]);
    expect(profileRepository.update).not.toHaveBeenCalled();
    expect(result).toStrictEqual(profileBasic);
  });

  it('should create a profile with avatar image', async () => {
    const profileUpdated = buildProfileEntity({
      avatarUrl: NEW_AVATAR_URL,
      coverPhotoUrl: null,
    });

    imageManager.saveImages.mockResolvedValueOnce([NEW_AVATAR_URL, null]);
    profileRepository.update.mockResolvedValue(profileUpdated);

    const result = await usecase.execute(profileBasic, avatarData);

    expect(imageManager.saveImages).toHaveBeenCalledWith([avatarData, null]);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(profileRepository.delete).not.toHaveBeenCalled();
    expect(result).toStrictEqual(profileUpdated.toBasic());
  });

  it('should create a profile with cover photo image', async () => {
    const profileUpdated = buildProfileEntity({
      avatarUrl: null,
      coverPhotoUrl: NEW_COVER_URL,
    });

    imageManager.saveImages.mockResolvedValueOnce([null, NEW_COVER_URL]);
    profileRepository.update.mockResolvedValue(profileUpdated);

    const result = await usecase.execute(profileBasic, undefined, coverData);

    expect(imageManager.saveImages).toHaveBeenCalledWith([null, coverData]);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(profileRepository.delete).not.toHaveBeenCalled();
    expect(result).toStrictEqual(profileUpdated.toBasic());
  });

  it('should create a profile with both avatar and cover images', async () => {
    const profileUpdated = buildProfileEntity({
      avatarUrl: NEW_AVATAR_URL,
      coverPhotoUrl: NEW_COVER_URL,
    });

    imageManager.saveImages.mockResolvedValueOnce([NEW_AVATAR_URL, NEW_COVER_URL]);
    profileRepository.update.mockResolvedValue(profileUpdated);

    const result = await usecase.execute(profileBasic, avatarData, coverData);

    expect(imageManager.saveImages).toHaveBeenCalledWith([avatarData, coverData]);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(profileRepository.delete).not.toHaveBeenCalled();
    expect(result).toStrictEqual(profileUpdated.toBasic());
  });

  // === FAILS ===

  it('should throw UniqueViolationError if user already has a profile', async () => {
    profileRepository.findByUserId.mockResolvedValue(profileData);

    await expect(usecase.execute(profileBasic)).rejects.toThrow(UniqueViolationError);

    expect(profileRepository.findByUserId).toHaveBeenCalledWith(profileData.userId);
    expect(profileRepository.findByUserName).not.toHaveBeenCalled();
    expect(profileRepository.create).not.toHaveBeenCalled();
  });

  it('should throw UniqueViolationError if username is already in use', async () => {
    profileRepository.findByUserName.mockResolvedValue(profileBasic);

    await expect(usecase.execute(profileData)).rejects.toThrow(UniqueViolationError);

    expect(profileRepository.findByUserId).toHaveBeenCalledWith(profileData.userId);
    expect(profileRepository.findByUserName).toHaveBeenCalledWith(profileData.username);
    expect(profileRepository.create).not.toHaveBeenCalled();
  });

  it('should delete the profile if image storage fails', async () => {
    imageManager.saveImages.mockRejectedValue(new Error('Storage service down'));

    await expect(usecase.execute(profileBasic, avatarData)).rejects.toThrow(
      'Storage service down',
    );

    expect(profileRepository.create).toHaveBeenCalledTimes(1);
    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(profileRepository.delete).toHaveBeenCalledWith(profileData.userId);
    expect(profileRepository.update).not.toHaveBeenCalled();
  });

  it('should delete the profile and new image if update fails after saving images', async () => {
    imageManager.saveImages.mockResolvedValue([NEW_AVATAR_URL, null]);
    profileRepository.update.mockRejectedValueOnce(new Error('Unique constraint error'));

    await expect(usecase.execute(profileBasic, avatarData)).rejects.toThrow(
      'Unique constraint error',
    );

    expect(profileRepository.create).toHaveBeenCalledTimes(1);
    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(profileRepository.delete).toHaveBeenCalledWith(profileData.userId);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledWith([NEW_AVATAR_URL, null]);
  });

  it('should delete the profile if the imageManager fails saving the images', async () => {
    imageManager.saveImages.mockRejectedValue(new Error('GCP down'));

    await expect(usecase.execute(profileBasic, avatarData, coverData)).rejects.toThrow(
      'GCP down',
    );

    expect(profileRepository.create).toHaveBeenCalledTimes(1);
    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(imageManager.saveImages).toHaveBeenCalledWith([avatarData, coverData]);
    expect(profileRepository.update).toHaveBeenCalledTimes(0);
    expect(profileRepository.delete).toHaveBeenCalledWith(profileData.userId);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledWith([null, null]);
  });

  it('should delete the profile if the urls are invalid', async () => {
    const invalidUrl = '/../../new/url';
    imageManager.saveImages.mockResolvedValue([NEW_AVATAR_URL, invalidUrl]);

    await expect(usecase.execute(profileBasic, avatarData, coverData)).rejects.toThrow(
      InvalidPathError,
    );

    expect(profileRepository.create).toHaveBeenCalledTimes(1);
    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(imageManager.saveImages).toHaveBeenCalledWith([avatarData, coverData]);
    expect(profileRepository.update).toHaveBeenCalledTimes(0);
    expect(profileRepository.delete).toHaveBeenCalledWith(profileData.userId);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledWith([NEW_AVATAR_URL, invalidUrl]);
  });

  it(`shouldn't execute the delete operation if repository create fails`, async () => {
    profileRepository.create.mockRejectedValueOnce(new Error('Unique constraint error'));

    await expect(usecase.execute(profileBasic)).rejects.toThrow('Unique constraint error');

    expect(profileRepository.create).toHaveBeenCalledTimes(1);
    expect(imageManager.saveImages).not.toHaveBeenCalled();
    expect(profileRepository.update).not.toHaveBeenCalled();
    expect(profileRepository.delete).not.toHaveBeenCalled();
  });

  it('should handle image storage returning null for both images', async () => {
    imageManager.saveImages.mockResolvedValueOnce([null, null]);

    const result = await usecase.execute(profileBasic, avatarData, coverData);

    expect(profileRepository.create).toHaveBeenCalledTimes(1);
    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(profileRepository.update).not.toHaveBeenCalled();
    expect(profileRepository.delete).not.toHaveBeenCalled();
    expect(result).toStrictEqual(profileBasic);
  });
});
