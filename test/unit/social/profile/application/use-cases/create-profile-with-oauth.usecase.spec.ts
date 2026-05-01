import { Test, TestingModule } from '@nestjs/testing';
import { CreateProfileWithOAuthUseCase } from '../../../../../../src/modules/social/profile/application/use-cases/create-profile-after-oauth.usecase';
import { ProfileRepository } from '../../../../../../src/modules/social/profile/domain/repositories/profile.repository';
import {
  InvalidProfileError,
  UniqueViolationError,
} from '../../../../../../src/modules/social/profile/domain/errors/profile.errors';
import { MockProfileRepository } from '../../infrastructure/repositories/profile.repository-mock';
import { ProfileEntity } from '../../../../../../src/modules/social/profile/domain/entities/profile.entity';
import { buildProfileEntity, CDN_URL } from '../../../../../factories/profile.factory';
import {
  OAuthProfile,
  ProfileBasic,
} from '../../../../../../src/modules/social/profile/domain/types/profile';
import { UsernameGeneratorService } from '../../../../../../src/modules/social/profile/application/services/username-generator.service';

describe('CreateProfileWithOAuthUseCase', () => {
  let usecase: CreateProfileWithOAuthUseCase;
  const profileRepository = new MockProfileRepository();
  const usernameService = new UsernameGeneratorService();

  const profileData: ProfileEntity = buildProfileEntity({ avatarUrl: CDN_URL });
  const profileBasic: ProfileBasic = profileData.toBasic();

  const oauthData: OAuthProfile = {
    userId: profileData.userId,
    name: profileData.username,
    avatarUrl: CDN_URL,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ProfileRepository, useValue: profileRepository },
        { provide: UsernameGeneratorService, useValue: usernameService },
        CreateProfileWithOAuthUseCase,
      ],
    }).compile();

    usecase = module.get<CreateProfileWithOAuthUseCase>(CreateProfileWithOAuthUseCase);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    profileRepository.findByUserId.mockResolvedValue(null);
    profileRepository.findUsernames.mockResolvedValue([]);
  });

  it('should create a profile successfully', async () => {
    profileRepository.create.mockResolvedValue(profileData);

    const result = await usecase.execute(oauthData);

    expect(profileRepository.findByUserId).toHaveBeenCalledWith(profileData.userId);
    expect(profileRepository.findUsernames).toHaveBeenCalledWith(profileData.username);
    expect(profileRepository.create).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(profileBasic);
  });

  it('should create a profile on the second attempt', async () => {
    profileRepository.create
      .mockRejectedValueOnce(new UniqueViolationError())
      .mockResolvedValueOnce(profileData);

    const result = await usecase.execute(oauthData);

    expect(profileRepository.findByUserId).toHaveBeenCalledTimes(1);
    expect(profileRepository.findUsernames).toHaveBeenCalledTimes(2);
    expect(profileRepository.create).toHaveBeenCalledTimes(2);
    expect(result).toStrictEqual(profileBasic);
  });

  it('should create a profile on the fifth attempt', async () => {
    profileRepository.create
      .mockRejectedValueOnce(new UniqueViolationError())
      .mockRejectedValueOnce(new UniqueViolationError())
      .mockRejectedValueOnce(new UniqueViolationError())
      .mockRejectedValueOnce(new UniqueViolationError())
      .mockResolvedValueOnce(profileData);

    const result = await usecase.execute(oauthData);

    expect(profileRepository.findByUserId).toHaveBeenCalledTimes(1);
    expect(profileRepository.findUsernames).toHaveBeenCalledTimes(5);
    expect(profileRepository.create).toHaveBeenCalledTimes(5);
    expect(result).toStrictEqual(profileBasic);
  });

  it('should throw an InvalidProfileError if it failed to create the user by username already in use', async () => {
    profileRepository.create
      .mockRejectedValueOnce(new UniqueViolationError())
      .mockRejectedValueOnce(new UniqueViolationError())
      .mockRejectedValueOnce(new UniqueViolationError())
      .mockRejectedValueOnce(new UniqueViolationError())
      .mockRejectedValueOnce(new UniqueViolationError());

    await expect(usecase.execute(oauthData)).rejects.toThrow(InvalidProfileError);

    expect(profileRepository.findByUserId).toHaveBeenCalledTimes(1);
    expect(profileRepository.findUsernames).toHaveBeenCalledTimes(5);
    expect(profileRepository.create).toHaveBeenCalledTimes(5);
  });

  it('should append _1 if base username is taken', async () => {
    const expectedUsername = `${profileData.username}_1`;
    profileRepository.findUsernames.mockResolvedValue([profileData.username]);
    profileRepository.create.mockResolvedValue(
      buildProfileEntity({ username: expectedUsername }),
    );

    const response = await usecase.execute(oauthData);

    expect(profileRepository.findByUserId).toHaveBeenCalledTimes(1);
    expect(profileRepository.findUsernames).toHaveBeenCalledTimes(1);
    expect(profileRepository.create).toHaveBeenCalledTimes(1);
    expect(response.username).toStrictEqual(expectedUsername);
  });

  it('should append _3 in the second attempt', async () => {
    const expectedUsername = `${profileData.username}_3`;
    profileRepository.findUsernames
      .mockResolvedValueOnce([profileData.username])
      .mockResolvedValueOnce([profileData.username, `${profileData.username}_2`]);
    profileRepository.create
      .mockRejectedValueOnce(new UniqueViolationError())
      .mockResolvedValueOnce(buildProfileEntity({ username: expectedUsername }));

    const response = await usecase.execute(oauthData);

    expect(profileRepository.findByUserId).toHaveBeenCalledTimes(1);
    expect(profileRepository.findUsernames).toHaveBeenCalledTimes(2);
    expect(profileRepository.create).toHaveBeenCalledTimes(2);
    expect(response.username).toStrictEqual(expectedUsername);
  });

  it('should throw an Error if the database fails', async () => {
    profileRepository.create.mockRejectedValueOnce(new Error());
    await expect(usecase.execute(oauthData)).rejects.toThrow(Error);

    expect(profileRepository.findByUserId).toHaveBeenCalledTimes(1);
    expect(profileRepository.findUsernames).toHaveBeenCalledTimes(1);
    expect(profileRepository.create).toHaveBeenCalledTimes(1);
  });
});
