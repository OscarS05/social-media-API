import { Test, TestingModule } from '@nestjs/testing';
import { GetProfileByUserIdUseCase } from '../../../../../../src/modules/social/profile/application/use-cases/get-profile-by-userId.usecase';
import { ProfileRepository } from '../../../../../../src/modules/social/profile/domain/repositories/profile.repository';
import { MockProfileRepository } from '../../infrastructure/repositories/profile.repository-mock';
import { ID } from '../../../../../factories/user.factory';
import {
  ALL_PROFILE_DATA,
  buildProfileEntity,
  LIMITED_PROFILE_DATA,
} from '../../../../../factories/profile.factory';
import { ProfileAccessContext } from '../../../../../../src/modules/social/profile/domain/types/profile';
import {
  DomainNotFoundError,
  ProfileAccessDeniedError,
} from '../../../../../../src/modules/social/profile/domain/errors/profile.errors';

describe('GetProfileByUserIdUseCase', () => {
  let usecase: GetProfileByUserIdUseCase;
  const profileRepo = new MockProfileRepository();

  const viewerId = ID;
  const ownerId = buildProfileEntity().userId;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ProfileRepository, useValue: profileRepo },
        GetProfileByUserIdUseCase,
      ],
    }).compile();
    usecase = module.get<GetProfileByUserIdUseCase>(GetProfileByUserIdUseCase);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // === SUCCESS ===

  it('should get all profile data successfully if the profile is public', async () => {
    const accessContext: ProfileAccessContext = {
      exists: true,
      isPrivate: false,
      isFollower: true,
      isFollowing: false,
      isBlocked: false,
    };

    profileRepo.getProfileAccessContext.mockResolvedValue(accessContext);
    profileRepo.getProfileViewByUserId.mockResolvedValue(ALL_PROFILE_DATA);

    const response = await usecase.execute(viewerId, ownerId);

    expect(profileRepo.getProfileAccessContext).toHaveBeenCalledTimes(1);
    expect(profileRepo.getProfileAccessContext).toHaveBeenCalledWith(viewerId, ownerId);
    expect(profileRepo.getProfileViewByUserId).toHaveBeenCalledTimes(1);
    expect(profileRepo.getProfileViewByUserId).toHaveBeenCalledWith(ownerId, {
      includePosts: true,
    });
    expect(response).toStrictEqual(ALL_PROFILE_DATA);
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
    profileRepo.getProfileViewByUserId.mockResolvedValue(ALL_PROFILE_DATA);

    const response = await usecase.execute(viewerId, ownerId);

    expect(profileRepo.getProfileAccessContext).toHaveBeenCalledTimes(1);
    expect(profileRepo.getProfileViewByUserId).toHaveBeenCalledTimes(1);
    expect(profileRepo.getProfileViewByUserId).toHaveBeenCalledWith(ownerId, {
      includePosts: true,
    });
    expect(response).toStrictEqual(ALL_PROFILE_DATA);
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
    profileRepo.getProfileViewByUserId.mockResolvedValue(LIMITED_PROFILE_DATA);

    const response = await usecase.execute(viewerId, ownerId);

    expect(profileRepo.getProfileAccessContext).toHaveBeenCalledTimes(1);
    expect(profileRepo.getProfileViewByUserId).toHaveBeenCalledTimes(1);
    expect(profileRepo.getProfileViewByUserId).toHaveBeenCalledWith(ownerId, {
      includePosts: false,
    });
    expect(response).toStrictEqual(LIMITED_PROFILE_DATA);
  });

  // === FAILS ===

  it('should throw an DomainNotFoundError if the profile does not exists', async () => {
    profileRepo.getProfileAccessContext.mockResolvedValue(null);

    await expect(usecase.execute(viewerId, ownerId)).rejects.toThrow(DomainNotFoundError);

    expect(profileRepo.getProfileAccessContext).toHaveBeenCalledTimes(1);
    expect(profileRepo.getProfileViewByUserId).toHaveBeenCalledTimes(0);
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

    await expect(usecase.execute(viewerId, ownerId)).rejects.toThrow(ProfileAccessDeniedError);

    expect(profileRepo.getProfileAccessContext).toHaveBeenCalledTimes(1);
    expect(profileRepo.getProfileViewByUserId).toHaveBeenCalledTimes(0);
  });

  it('should throw an InternalServerError if the database failed', async () => {
    profileRepo.getProfileAccessContext.mockRejectedValue(new Error('Database failed'));

    await expect(usecase.execute(viewerId, ownerId)).rejects.toThrow('Database failed');

    expect(profileRepo.getProfileAccessContext).toHaveBeenCalledTimes(1);
    expect(profileRepo.getProfileViewByUserId).toHaveBeenCalledTimes(0);
  });
});
