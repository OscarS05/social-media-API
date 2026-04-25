import { Test, TestingModule } from '@nestjs/testing';
import { CreateProfileUseCase } from '../../../../../../src/modules/social/profile/application/use-cases/create-profile.usecase';
import { ProfileRepository } from '../../../../../../src/modules/social/profile/domain/repositories/profile.repository';
import { ImageStoragePort } from '../../../../../../src/shared/domain/services/image.service';
import { InvalidProfileError } from '../../../../../../src/modules/social/profile/domain/errors/profile.errors';
import { MockProfileRepository } from '../../infrastructure/repositories/profile.repository-mock';
import { MockImageStorage } from '../../infrastructure/services/image.service-mock';
import { ProfileEntity } from '../../../../../../src/modules/social/profile/domain/entities/profile.entity';
import {
  AVATAR_URL,
  avatarData,
  buildProfileEntity,
  COVER_URL,
  coverData,
} from '../../../../../factories/profile.factory';
import { ProfileBasic } from '../../../../../../src/modules/social/profile/domain/types/profile';

describe('CreateProfileUseCase', () => {
  let usecase: CreateProfileUseCase;
  const profileRepository = new MockProfileRepository();
  const imageService = new MockImageStorage();

  const profileData: ProfileEntity = buildProfileEntity();
  const profileBasic: ProfileBasic = profileData.toBasic();

  const mockAvatarPath = { get: () => AVATAR_URL };
  const mockCoverPath = { get: () => COVER_URL };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ProfileRepository, useValue: profileRepository },
        { provide: ImageStoragePort, useValue: imageService },
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
    profileRepository.delete.mockResolvedValue({ affected: 1 });
  });

  it('should create a profile without images', async () => {
    const result = await usecase.execute(profileBasic);

    expect(profileRepository.findByUserId).toHaveBeenCalledWith(profileData.userId);
    expect(profileRepository.findByUserName).toHaveBeenCalledWith(profileData.username);
    expect(profileRepository.create).toHaveBeenCalledTimes(1);
    expect(imageService.save).not.toHaveBeenCalled();
    expect(profileRepository.update).not.toHaveBeenCalled();
    expect(result).toStrictEqual(profileBasic);
  });

  it('should create a profile with avatar image', async () => {
    imageService.save.mockResolvedValueOnce(mockAvatarPath);
    profileRepository.update.mockResolvedValue(
      buildProfileEntity({
        ...profileData,
        avatarUrl: mockAvatarPath.get(),
      }),
    );

    const result = await usecase.execute(profileBasic, avatarData);

    expect(imageService.save).toHaveBeenCalledWith(avatarData.buffer, avatarData.filename);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(profileRepository.delete).not.toHaveBeenCalled();
    expect(result).toStrictEqual({
      ...profileBasic,
      avatarUrl: mockAvatarPath.get(),
    });
  });

  it('should create a profile with cover photo image', async () => {
    imageService.save.mockResolvedValueOnce(mockCoverPath);
    profileRepository.update.mockResolvedValue(
      buildProfileEntity({
        ...profileData,
        coverPhotoUrl: mockCoverPath.get(),
      }),
    );

    const result = await usecase.execute(profileBasic, undefined, coverData);

    expect(imageService.save).toHaveBeenCalledWith(coverData.buffer, coverData.filename);
    expect(profileRepository.delete).not.toHaveBeenCalled();
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual({
      ...profileBasic,
      coverPhotoUrl: mockCoverPath.get(),
    });
  });

  it('should create a profile with both avatar and cover images', async () => {
    imageService.save
      .mockResolvedValueOnce(mockAvatarPath)
      .mockResolvedValueOnce(mockCoverPath);
    profileRepository.update.mockResolvedValue(
      buildProfileEntity({
        ...profileData,
        coverPhotoUrl: mockCoverPath.get(),
        avatarUrl: mockAvatarPath.get(),
      }),
    );

    const result = await usecase.execute(profileBasic, avatarData, coverData);

    expect(imageService.save).toHaveBeenCalledTimes(2);
    expect(imageService.save).toHaveBeenNthCalledWith(
      1,
      avatarData.buffer,
      avatarData.filename,
    );
    expect(imageService.save).toHaveBeenNthCalledWith(2, coverData.buffer, coverData.filename);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual({
      ...profileBasic,
      coverPhotoUrl: mockCoverPath.get(),
      avatarUrl: mockAvatarPath.get(),
    });
  });

  it('should throw InvalidProfileError if user already has a profile', async () => {
    profileRepository.findByUserId.mockResolvedValue(profileData);

    await expect(usecase.execute(profileBasic)).rejects.toThrow(InvalidProfileError);

    expect(profileRepository.findByUserId).toHaveBeenCalledWith(profileData.userId);
    expect(profileRepository.findByUserName).not.toHaveBeenCalled();
    expect(profileRepository.create).not.toHaveBeenCalled();
  });

  it('should throw InvalidProfileError if username is already in use', async () => {
    profileRepository.findByUserName.mockResolvedValue(profileBasic);

    await expect(usecase.execute(profileData)).rejects.toThrow(InvalidProfileError);

    expect(profileRepository.findByUserId).toHaveBeenCalledWith(profileData.userId);
    expect(profileRepository.findByUserName).toHaveBeenCalledWith(profileData.username);
    expect(profileRepository.create).not.toHaveBeenCalled();
  });

  it('should delete the profile if image storage fails', async () => {
    imageService.save.mockRejectedValueOnce(new Error('Storage service down'));

    await expect(usecase.execute(profileBasic, avatarData)).rejects.toThrow(
      'Storage service down',
    );

    expect(profileRepository.create).toHaveBeenCalledTimes(1);
    expect(profileRepository.delete).toHaveBeenCalledWith(profileData.userId);
    expect(profileRepository.update).not.toHaveBeenCalled();
  });

  it('should delete the profile if update fails after saving images', async () => {
    const mockAvatarPath = { get: () => '/images/avatar-123.jpg' };
    imageService.save.mockResolvedValueOnce(mockAvatarPath).mockResolvedValueOnce(null);
    profileRepository.update.mockRejectedValueOnce(new Error('Database error'));

    await expect(usecase.execute(profileBasic, avatarData)).rejects.toThrow('Database error');

    expect(profileRepository.create).toHaveBeenCalledTimes(1);
    expect(imageService.save).toHaveBeenCalledTimes(1);
    expect(profileRepository.update).toHaveBeenCalledTimes(1);
    expect(profileRepository.delete).toHaveBeenCalledWith(profileData.userId);
  });

  it(`shouldn't execute the delete operation if repository create fails`, async () => {
    profileRepository.create.mockRejectedValueOnce(new Error('Database error'));

    await expect(usecase.execute(profileBasic)).rejects.toThrow('Database error');

    expect(profileRepository.create).toHaveBeenCalledTimes(1);
    expect(imageService.save).not.toHaveBeenCalled();
    expect(profileRepository.update).not.toHaveBeenCalled();
    expect(profileRepository.delete).not.toHaveBeenCalled();
  });

  it('should handle image storage returning null for both images', async () => {
    imageService.save.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    const result = await usecase.execute(profileBasic, avatarData, coverData);

    expect(profileRepository.create).toHaveBeenCalledTimes(1);
    expect(imageService.save).toHaveBeenCalledTimes(2);
    expect(profileRepository.update).not.toHaveBeenCalled();
    expect(profileRepository.delete).not.toHaveBeenCalled();
    expect(result).toStrictEqual(profileBasic);
  });
});
