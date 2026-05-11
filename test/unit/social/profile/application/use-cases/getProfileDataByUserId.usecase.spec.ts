import { Test, TestingModule } from '@nestjs/testing';
import { GetProfileDataByUserIdUseCase } from '../../../../../../src/modules/social/profile/application/use-cases/getProfileDataByUserId.usecase';
import { ProfileRepository } from '../../../../../../src/modules/social/profile/domain/repositories/profile.repository';
import { MockProfileRepository } from '../../infrastructure/repositories/profile.repository-mock';
import {
  ALL_PROFILE_DATA,
  buildProfileEntity,
  LIMITED_PROFILE_DATA,
  PROFILE_DATA,
} from '../../../../../factories/profile.factory';
import { ProfileAccessContext } from '../../../../../../src/modules/social/profile/domain/types/profile';
import {
  DomainNotFoundError,
  ProfileAccessDeniedError,
} from '../../../../../../src/modules/social/profile/domain/errors/profile.errors';
import { MockPostRepository } from '../../infrastructure/repositories/post.repository';
import { PostRepository } from '../../../../../../src/modules/social/profile/domain/repositories/post.respository';
import { POST_PREVIEW } from '../../../../../factories/posts.factory';
import { ADMIN_ID } from '../../../../../factories/user.factory';

describe('GetProfileDataByUserIdUseCase', () => {
  let usecase: GetProfileDataByUserIdUseCase;
  const profileRepo = new MockProfileRepository();
  const postRepo = new MockPostRepository();

  const viewerId = ADMIN_ID;
  const ownerId = buildProfileEntity().userId;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ProfileRepository, useValue: profileRepo },
        { provide: PostRepository, useValue: postRepo },
        GetProfileDataByUserIdUseCase,
      ],
    }).compile();
    usecase = module.get<GetProfileDataByUserIdUseCase>(GetProfileDataByUserIdUseCase);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Successful cases', () => {
    it('should get all profile data successfully if the profile is public', async () => {
      const accessContext: ProfileAccessContext = {
        exists: true,
        isPrivate: false,
        isFollower: true,
        isFollowing: false,
        isBlocked: false,
      };

      profileRepo.getProfileAccessContext.mockResolvedValue(accessContext);
      profileRepo.getProfileBaseView.mockResolvedValue(PROFILE_DATA);
      postRepo.getPostsPreview.mockResolvedValue([POST_PREVIEW]);

      const response = await usecase.execute(viewerId, ownerId);

      expect(profileRepo.getProfileAccessContext).toHaveBeenCalledTimes(1);
      expect(profileRepo.getProfileAccessContext).toHaveBeenCalledWith(viewerId, ownerId);
      expect(profileRepo.getProfileBaseView).toHaveBeenCalledTimes(1);
      expect(profileRepo.getProfileBaseView).toHaveBeenCalledWith(ownerId);
      expect(postRepo.getPostsPreview).toHaveBeenCalledTimes(1);
      expect(postRepo.getPostsPreview).toHaveBeenCalledWith(ownerId, { limit: 15 });
      expect(response).toStrictEqual({
        ...PROFILE_DATA,
        posts: [POST_PREVIEW],
      });
    });

    it('should get all profile data if the profile is private and the requested user is followed and follower', async () => {
      const accessContext: ProfileAccessContext = {
        exists: true,
        isPrivate: true,
        isFollower: true,
        isFollowing: true,
        isBlocked: false,
      };

      profileRepo.getProfileAccessContext.mockResolvedValue(accessContext);
      profileRepo.getProfileBaseView.mockResolvedValue(PROFILE_DATA);
      postRepo.getPostsPreview.mockResolvedValue(ALL_PROFILE_DATA.posts);

      const response = await usecase.execute(viewerId, ownerId);

      expect(profileRepo.getProfileAccessContext).toHaveBeenCalledTimes(1);
      expect(profileRepo.getProfileBaseView).toHaveBeenCalledTimes(1);
      expect(profileRepo.getProfileBaseView).toHaveBeenCalledWith(ownerId);
      expect(postRepo.getPostsPreview).toHaveBeenCalledTimes(1);
      expect(postRepo.getPostsPreview).toHaveBeenCalledWith(ownerId, { limit: 15 });
      expect(response).toMatchObject({ ...PROFILE_DATA, posts: ALL_PROFILE_DATA.posts });
    });

    it('should get limited profile data if the profile is private and the requested user is NOT followed and follower', async () => {
      const accessContext: ProfileAccessContext = {
        exists: true,
        isPrivate: true,
        isFollower: true,
        isFollowing: false,
        isBlocked: false,
      };

      profileRepo.getProfileAccessContext.mockResolvedValue(accessContext);
      profileRepo.getProfileBaseView.mockResolvedValue(PROFILE_DATA);

      const response = await usecase.execute(viewerId, ownerId);

      expect(profileRepo.getProfileAccessContext).toHaveBeenCalledTimes(1);
      expect(profileRepo.getProfileBaseView).toHaveBeenCalledTimes(1);
      expect(profileRepo.getProfileBaseView).toHaveBeenCalledWith(ownerId);
      expect(postRepo.getPostsPreview).toHaveBeenCalledTimes(0);
      expect(response).toMatchObject({ ...PROFILE_DATA, posts: LIMITED_PROFILE_DATA.posts });
    });
  });

  describe('Fail cases', () => {
    it('should throw an DomainNotFoundError if the profile does not exists', async () => {
      profileRepo.getProfileAccessContext.mockResolvedValue(null);

      await expect(usecase.execute(viewerId, ownerId)).rejects.toThrow(DomainNotFoundError);

      expect(profileRepo.getProfileAccessContext).toHaveBeenCalledTimes(1);
      expect(profileRepo.getProfileBaseView).toHaveBeenCalledTimes(0);
    });

    it('should throw an ProfileAccessDeniedError if there is a block', async () => {
      const accessContext: ProfileAccessContext = {
        exists: true,
        isPrivate: true,
        isFollower: false,
        isFollowing: false,
        isBlocked: true,
      };

      profileRepo.getProfileAccessContext.mockResolvedValue(accessContext);

      await expect(usecase.execute(viewerId, ownerId)).rejects.toThrow(
        ProfileAccessDeniedError,
      );

      expect(profileRepo.getProfileAccessContext).toHaveBeenCalledTimes(1);
      expect(profileRepo.getProfileBaseView).toHaveBeenCalledTimes(0);
    });

    it('should throw an InternalServerError if the database failed', async () => {
      profileRepo.getProfileAccessContext.mockRejectedValue(new Error('Database failed'));

      await expect(usecase.execute(viewerId, ownerId)).rejects.toThrow('Database failed');

      expect(profileRepo.getProfileAccessContext).toHaveBeenCalledTimes(1);
      expect(profileRepo.getProfileBaseView).toHaveBeenCalledTimes(0);
    });
  });
});
