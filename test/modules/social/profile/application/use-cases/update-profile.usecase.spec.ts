import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProfileUseCase } from '../../../../../../src/modules/social/profile/application/use-cases/update-profile.usecase';
import { ProfileRepository } from '../../../../../../src/modules/social/profile/domain/repositories/profile.repository';
import {
  DomainNotFoundError,
  InternalServerError,
  InvalidPathError,
  InvalidUsernameError,
  UsernameAlreadyInUseError,
} from '../../../../../../src/modules/social/profile/domain/errors/profile.errors';
import { MockProfileRepository } from '../../infrastructure/repositories/profile.repository-mock';
import { ProfileEntity } from '../../../../../../src/modules/social/profile/domain/entities/profile.entity';
import {
  AVATAR_URL,
  avatarData,
  buildProfileEntity,
  COVER_URL,
  coverData,
  NEW_AVATAR_URL,
  NEW_COVER_URL,
  newUrlImages,
  urlImages,
} from '../../../../../factories/profile.factory';
import { ProfileBasic } from '../../../../../../src/modules/social/profile/domain/types/profile';
import { Privacy } from '../../../../../../src/modules/social/profile/domain/enums/privacy.enum';
import { MockImageManagerService } from '../../../../shared/imageManagerService';
import { MockImageStorage } from '../../infrastructure/services/image.service-mock';
import { ImageManagerService } from '../../../../../../src/modules/social/profile/domain/services/image-manager.service';

describe('UpdateProfileUseCase', () => {
  let usecase: UpdateProfileUseCase;
  const profileRepository = new MockProfileRepository();
  const imageStorage = new MockImageStorage();
  const imageManager = new MockImageManagerService(imageStorage);

  const profileData: ProfileEntity = buildProfileEntity();
  const profileBasic: ProfileBasic = profileData.toBasic();
  const useCaseResponse: ProfileBasic = profileData.toBasic();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ProfileRepository, useValue: profileRepository },
        { provide: ImageManagerService, useValue: imageManager },
        UpdateProfileUseCase,
      ],
    }).compile();

    usecase = module.get<UpdateProfileUseCase>(UpdateProfileUseCase);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    profileRepository.findByUserId.mockResolvedValue(buildProfileEntity({ ...urlImages }));
    profileRepository.findByUserName.mockResolvedValue(null);
  });

  // === SUCCESS ===

  it('should update a profile with all its data', async () => {
    imageManager.saveImages.mockResolvedValueOnce([NEW_AVATAR_URL, NEW_COVER_URL]);
    imageManager.deleteImages.mockResolvedValue([true, true]);
    profileRepository.update.mockResolvedValue(buildProfileEntity({ ...newUrlImages }));

    const result = await usecase.execute(
      profileBasic.userId,
      profileBasic,
      avatarData,
      coverData,
    );

    expect(profileRepository.findByUserId).toHaveBeenCalledWith(profileData.userId);
    expect(profileRepository.findByUserName).toHaveBeenCalledWith(profileData.username);
    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledWith([AVATAR_URL, COVER_URL]);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual({
      ...useCaseResponse,
      ...newUrlImages,
    });
  });

  it('should update a profile with only avatar image', async () => {
    imageManager.saveImages.mockResolvedValueOnce([NEW_AVATAR_URL, null]);
    imageManager.deleteImages.mockResolvedValueOnce([true]);
    profileRepository.update.mockResolvedValue(
      buildProfileEntity({ avatarUrl: NEW_AVATAR_URL }),
    );

    const result = await usecase.execute(
      profileBasic.userId,
      profileBasic,
      avatarData,
      undefined,
    );

    expect(profileRepository.findByUserId).toHaveBeenCalledTimes(1);
    expect(profileRepository.findByUserName).toHaveBeenCalledTimes(1);
    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledWith([AVATAR_URL, null]);
    expect(result).toStrictEqual({ ...profileBasic, avatarUrl: NEW_AVATAR_URL });
  });

  it('should update a profile with only cover image', async () => {
    imageManager.saveImages.mockResolvedValueOnce([null, NEW_COVER_URL]);
    imageManager.deleteImages.mockResolvedValueOnce([true]);
    profileRepository.update.mockResolvedValue(
      buildProfileEntity({ coverPhotoUrl: NEW_COVER_URL }),
    );

    const result = await usecase.execute(
      profileBasic.userId,
      profileBasic,
      undefined,
      coverData,
    );

    expect(profileRepository.findByUserId).toHaveBeenCalledTimes(1);
    expect(profileRepository.findByUserName).toHaveBeenCalledTimes(1);
    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledWith([null, COVER_URL]);
    expect(result).toStrictEqual({ ...profileBasic, coverPhotoUrl: NEW_COVER_URL });
  });

  it('should update the profile without username', async () => {
    const updateProfile = buildProfileEntity({
      bio: 'new bio',
      typePrivacy: Privacy.PRIVATE,
    });
    const { username: usernameNotUpdated, ...changes } = updateProfile;

    imageManager.saveImages.mockResolvedValueOnce([null, null]);
    profileRepository.update.mockResolvedValue(
      buildProfileEntity({ ...updateProfile.toBasic() }),
    );

    const result = await usecase.execute(profileBasic.userId, changes);

    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(1);

    expect(result).toStrictEqual(updateProfile.toBasic()); // This means that it was updated
    expect(result.username).toStrictEqual(usernameNotUpdated); // This means that it wasn´t updated
  });

  it('should update the profile without bio', async () => {
    const updateProfile = buildProfileEntity({
      username: 'username_updated',
      typePrivacy: Privacy.PRIVATE,
    });
    const { bio: bioNotUpdated, ...changes } = updateProfile;

    imageManager.saveImages.mockResolvedValue([null, null]);
    profileRepository.update.mockResolvedValue(
      buildProfileEntity({ ...updateProfile.toBasic() }),
    );

    const result = await usecase.execute(profileBasic.userId, changes);

    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(updateProfile.toBasic()); // This means that it was updated
    expect(result.bio).toStrictEqual(bioNotUpdated); // This means that it wasn´t updated
  });

  it('should update the profile without privacy', async () => {
    const updateProfile = buildProfileEntity({
      username: 'username_updated',
      bio: 'new bio',
    });
    const { typePrivacy: privacyNotUpdated, ...changes } = updateProfile;

    profileRepository.update.mockResolvedValue(
      buildProfileEntity({ ...updateProfile.toBasic() }),
    );

    const result = await usecase.execute(profileBasic.userId, changes);

    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(updateProfile.toBasic()); // This means that it was updated
    expect(result.typePrivacy).toStrictEqual(privacyNotUpdated); // This means that it wasn´t updated
  });

  it(`should update the profile with images, but the profile didn't have any images before`, async () => {
    profileRepository.findByUserId.mockResolvedValue(
      buildProfileEntity({ avatarUrl: null, coverPhotoUrl: null }),
    );
    imageManager.saveImages.mockResolvedValueOnce([NEW_AVATAR_URL, NEW_COVER_URL]);
    profileRepository.update.mockResolvedValue(buildProfileEntity({ ...newUrlImages }));

    const result = await usecase.execute(
      profileBasic.userId,
      profileBasic,
      avatarData,
      coverData,
    );

    expect(profileRepository.findByUserId).toHaveBeenCalledTimes(1);
    expect(profileRepository.findByUserName).toHaveBeenCalledTimes(1);
    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledWith([null, null]);
    expect(result).toStrictEqual({ ...profileBasic, ...newUrlImages });
  });

  // === FAILS ===

  it('should throw DomainNotFoundError if user has NOT a profile', async () => {
    profileRepository.findByUserId.mockResolvedValue(null);
    await expect(usecase.execute(profileBasic.userId, profileBasic)).rejects.toThrow(
      DomainNotFoundError,
    );
    expect(profileRepository.findByUserId).toHaveBeenCalledWith(profileData.userId);
    expect(profileRepository.findByUserName).not.toHaveBeenCalled();
    expect(profileRepository.update).not.toHaveBeenCalled();
  });

  it('should throw UsernameAlreadyInUseError if username is already in use', async () => {
    profileRepository.findByUserName.mockResolvedValue(profileBasic);
    await expect(usecase.execute(profileData.userId, profileData)).rejects.toThrow(
      UsernameAlreadyInUseError,
    );
    expect(profileRepository.findByUserName).toHaveBeenCalledWith(profileData.username);
    expect(profileRepository.update).not.toHaveBeenCalled();
  });

  it('should throw an error if the updating fails. case: new avatar and cover are NOT provided', async () => {
    imageManager.saveImages.mockResolvedValueOnce([null, null]);
    profileRepository.update.mockRejectedValue(new InternalServerError());
    await expect(usecase.execute(profileBasic.userId, profileBasic)).rejects.toThrow(
      InternalServerError,
    );
    expect(profileRepository.findByUserName).toHaveBeenCalledTimes(1);
    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(imageManager.saveImages).toHaveBeenCalledWith([null, null]);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledWith([null, null]);
  });

  it('should throw an error and delete new images if the updating fails. case: new avatar and cover ARE provided', async () => {
    imageManager.saveImages.mockResolvedValueOnce([NEW_AVATAR_URL, NEW_COVER_URL]);
    profileRepository.update.mockRejectedValueOnce(new InternalServerError());
    imageManager.deleteImages.mockResolvedValueOnce(undefined);

    await expect(
      usecase.execute(profileBasic.userId, profileBasic, avatarData, coverData),
    ).rejects.toThrow(InternalServerError);

    expect(profileRepository.findByUserName).toHaveBeenCalledTimes(1);
    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledWith([NEW_AVATAR_URL, NEW_COVER_URL]);
  });

  it('should not delete or update the avatar image if the imageManager returns null', async () => {
    const profile = buildProfileEntity({ avatarUrl: null, coverPhotoUrl: null });

    profileRepository.findByUserId.mockResolvedValue(profile);
    imageManager.saveImages.mockResolvedValueOnce([null, null]);
    profileRepository.update.mockResolvedValue(profile);

    const result = await usecase.execute(
      profileBasic.userId,
      profileBasic,
      avatarData,
      undefined,
    );

    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledWith([null, null]);
    expect(result).toStrictEqual(profile.toBasic()); // Profile without update the avatar
  });

  it('should not delete or update the cover image if the imageManager returns null', async () => {
    const profile = buildProfileEntity({ avatarUrl: null, coverPhotoUrl: null });

    profileRepository.findByUserId.mockResolvedValue(profile);
    imageManager.saveImages.mockResolvedValueOnce([null, null]);
    profileRepository.update.mockResolvedValue(profile);

    const result = await usecase.execute(
      profileBasic.userId,
      profileBasic,
      undefined,
      coverData,
    );

    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledWith([null, null]);
    expect(result).toStrictEqual(profile.toBasic());
  });

  it('should not delete or update the avatar image if the imageManager throws an error', async () => {
    imageManager.saveImages.mockRejectedValueOnce(new InternalServerError());

    await expect(
      usecase.execute(profileBasic.userId, profileBasic, avatarData, undefined),
    ).rejects.toThrow(InternalServerError);

    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(profileRepository.update).toHaveBeenCalledTimes(0);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(0);
  });

  it('should not delete or update the cover image if the imageManager throws an error', async () => {
    imageManager.saveImages.mockRejectedValueOnce(new InternalServerError());

    await expect(
      usecase.execute(profileBasic.userId, profileBasic, undefined, coverData),
    ).rejects.toThrow(InternalServerError);

    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(profileRepository.update).toHaveBeenCalledTimes(0);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(0);
  });

  it('should throw an InvalidUsernameError if the username is invalid', async () => {
    profileRepository.findByUserId.mockResolvedValue(profileData);

    await expect(
      usecase.execute(profileBasic.userId, { ...profileBasic, username: 'invalid__username' }),
    ).rejects.toThrow(InvalidUsernameError);

    expect(profileRepository.findByUserId).toHaveBeenCalledTimes(1);
    expect(profileRepository.findByUserName).toHaveBeenCalledTimes(0);
    expect(imageManager.saveImages).toHaveBeenCalledTimes(0);
    expect(profileRepository.update).toHaveBeenCalledTimes(0);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(0);
  });

  it('should throw an InvalidUrlError if the url is invalid and delete the new images', async () => {
    const invalidUrl = '/invalid/../../path';
    profileRepository.findByUserId.mockResolvedValue(profileData);
    imageManager.saveImages.mockResolvedValueOnce([invalidUrl, NEW_COVER_URL]);

    await expect(
      usecase.execute(profileBasic.userId, profileBasic, avatarData),
    ).rejects.toThrow(InvalidPathError);

    expect(profileRepository.findByUserId).toHaveBeenCalledTimes(1);
    expect(imageManager.saveImages).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledTimes(1);
    expect(imageManager.deleteImages).toHaveBeenCalledWith([invalidUrl, NEW_COVER_URL]);
    expect(profileRepository.update).toHaveBeenCalledTimes(0);
  });
});
