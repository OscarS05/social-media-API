import { Test, TestingModule } from '@nestjs/testing';
import { ProfileRepository } from '../../../../../../src/modules/social/profile/domain/repositories/profile.repository';
import { MockProfileRepository } from '../../infrastructure/repositories/profile.repository-mock';
import { GetProfilesPreviewUseCase } from '../../../../../../src/modules/social/profile/application/use-cases/getProfilesPreview.usecase';
import { AVATAR_URL, buildProfileEntity } from '../../../../../factories/profile.factory';
import { InvalidUsernameError } from '../../../../../../src/modules/social/profile/domain/errors/profile.errors';

describe('GetProfilesPreviewUseCase', () => {
  let usecase: GetProfilesPreviewUseCase;
  const profileRepo = new MockProfileRepository();
  const pagination = {
    page: 1,
    limit: 15,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ProfileRepository, useValue: profileRepo },
        GetProfilesPreviewUseCase,
      ],
    }).compile();
    usecase = module.get<GetProfilesPreviewUseCase>(GetProfilesPreviewUseCase);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TODO: Update my test suite because the use case already received an object like the tests in 'successful cases', but also, instead of return a profile preview, return an object with data and pagination info
  describe('Successful cases', () => {
    it('should get a list of profile previews if there are coincidences', async () => {
      const profileData = buildProfileEntity({ avatarUrl: AVATAR_URL });
      const profilePreview = [profileData, profileData, profileData];

      profileRepo.findAllProfilesByUsername.mockResolvedValue({
        data: profilePreview,
        total: profilePreview.length,
      });

      const response = await usecase.execute({ username: 'username123', ...pagination });

      expect(response).toStrictEqual({
        data: profilePreview,
        ...pagination,
        total: profilePreview.length,
        hasNextPage: false,
      });
    });

    it('should get an empty list if there are not coincidences', async () => {
      profileRepo.findAllProfilesByUsername.mockResolvedValue({
        data: [],
        total: 0,
      });

      const response = await usecase.execute({ username: 'username123', ...pagination });

      expect(response).toStrictEqual({
        data: [],
        ...pagination,
        total: 0,
        hasNextPage: false,
      });
    });
  });

  describe('Fail cases', () => {
    it('should throw an error if the database failed', async () => {
      profileRepo.findAllProfilesByUsername.mockRejectedValue(new Error('Database down'));

      await expect(
        usecase.execute({ username: 'valid_username_123', ...pagination }),
      ).rejects.toThrow('Database down');
    });

    it('should throw an error if the username is invalid', async () => {
      await expect(
        usecase.execute({ username: 'invalid__username__', ...pagination }),
      ).rejects.toThrow(InvalidUsernameError);
    });
  });
});
