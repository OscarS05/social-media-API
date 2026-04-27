import { Test, TestingModule } from '@nestjs/testing';
import { ProfileRepository } from '../../../../../../src/modules/social/profile/domain/repositories/profile.repository';
import { MockProfileRepository } from '../../infrastructure/repositories/profile.repository-mock';
import { GetProfilesByUsernameUseCase } from '../../../../../../src/modules/social/profile/application/use-cases/get-profiles-by-username.usecase';
import { AVATAR_URL, buildProfileEntity } from '../../../../../factories/profile.factory';
import { InvalidUsernameError } from '../../../../../../src/modules/social/profile/domain/errors/profile.errors';

describe('GetProfilesByUsernameUseCase', () => {
  let usecase: GetProfilesByUsernameUseCase;
  const profileRepo = new MockProfileRepository();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ProfileRepository, useValue: profileRepo },
        GetProfilesByUsernameUseCase,
      ],
    }).compile();
    usecase = module.get<GetProfilesByUsernameUseCase>(GetProfilesByUsernameUseCase);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // === SUCCESS ===

  it('should get a list of profile previews if there are coincidences', async () => {
    const profileData = buildProfileEntity({ avatarUrl: AVATAR_URL });
    const profilePreview = [profileData, profileData, profileData];

    profileRepo.findAllProfilesByUsername.mockResolvedValue(profilePreview);

    const response = await usecase.execute('username123');

    expect(response).toStrictEqual(profilePreview);
  });

  it('should get an empty list if there are not coincidences', async () => {
    profileRepo.findAllProfilesByUsername.mockResolvedValue([]);

    const response = await usecase.execute('username123');

    expect(response).toStrictEqual([]);
  });

  // === FAILS ===

  it('should throw an error if the database failed', async () => {
    profileRepo.findAllProfilesByUsername.mockRejectedValue(new Error('Database down'));

    await expect(usecase.execute('valid_username_123')).rejects.toThrow('Database down');
  });

  it('should throw an error if the database failed', async () => {
    await expect(usecase.execute('invalid__username__')).rejects.toThrow(InvalidUsernameError);
  });
});
