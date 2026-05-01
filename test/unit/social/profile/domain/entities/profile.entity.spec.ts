import { ProfileEntity } from '../../../../../../src/modules/social/profile/domain/entities/profile.entity';
import { Privacy } from '../../../../../../src/modules/social/profile/domain/enums/privacy.enum';
import {
  Profile,
  ProfileBasic,
  UpdateProfileData,
} from '../../../../../../src/modules/social/profile/domain/types/profile';
import {
  InvalidPathError,
  InvalidUrlError,
  InvalidUsernameError,
} from '../../../../../../src/modules/social/profile/domain/errors/profile.errors';

// Test data
const validProfileBasic: ProfileBasic = {
  userId: '0620bfd3-7781-445d-b490-4b5204c81780',
  username: 'validuser',
  avatarUrl: 'https://example.com/avatar.jpg',
  coverPhotoUrl: 'https://example.com/cover.jpg',
  typePrivacy: Privacy.PUBLIC,
  bio: 'This is a bio',
};

const validProfile: Profile = {
  userId: '0620bfd3-7781-445d-b490-4b5204c81780',
  username: 'validuser',
  avatarUrl: 'https://example.com/avatar.jpg',
  coverPhotoUrl: 'https://example.com/cover.jpg',
  typePrivacy: Privacy.PUBLIC,
  bio: 'This is a bio',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  deletedAt: null,
};

const updateData: UpdateProfileData = {
  username: 'updateduser',
  bio: 'Updated bio',
  typePrivacy: Privacy.PRIVATE,
  avatarUrl: 'https://example.com/new-avatar.jpg',
  coverPhotoUrl: null,
};

describe('ProfileEntity', () => {
  describe('create', () => {
    it('should create a profile entity successfully', () => {
      const profile = ProfileEntity.create(validProfileBasic);

      expect(profile.userId).toBe(validProfileBasic.userId);
      expect(profile.username).toBe(validProfileBasic.username);
      expect(profile.avatarUrl).toBe(validProfileBasic.avatarUrl);
      expect(profile.coverPhotoUrl).toBe(validProfileBasic.coverPhotoUrl);
      expect(profile.typePrivacy).toBe(validProfileBasic.typePrivacy);
      expect(profile.bio).toBe(validProfileBasic.bio);
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
      expect(profile.deletedAt).toBeNull();
    });

    it('should create profile with null avatar and cover if not provided', () => {
      const dataWithoutUrls: ProfileBasic = {
        ...validProfileBasic,
        avatarUrl: undefined,
        coverPhotoUrl: undefined,
      };

      const profile = ProfileEntity.create(dataWithoutUrls);

      expect(profile.avatarUrl).toBeNull();
      expect(profile.coverPhotoUrl).toBeNull();
    });

    it('should throw error for invalid username', () => {
      const invalidData = { ...validProfileBasic, username: 'us' }; // too short

      expect(() => ProfileEntity.create(invalidData)).toThrow(InvalidUsernameError);
    });

    it('should create profile with empty bio', () => {
      const dataWithEmptyBio = { ...validProfileBasic, bio: '' };

      const profile = ProfileEntity.create(dataWithEmptyBio);

      expect(profile.bio).toBeNull();
    });
  });

  describe('fromPersistence', () => {
    it('should create profile from persistence data', () => {
      const profile = ProfileEntity.fromPersistence(validProfile);

      expect(profile.userId).toBe(validProfile.userId);
      expect(profile.username).toBe(validProfile.username);
      expect(profile.avatarUrl).toBe(validProfile.avatarUrl);
      expect(profile.coverPhotoUrl).toBe(validProfile.coverPhotoUrl);
      expect(profile.typePrivacy).toBe(validProfile.typePrivacy);
      expect(profile.bio).toBe(validProfile.bio);
      expect(profile.createdAt).toEqual(validProfile.createdAt);
      expect(profile.updatedAt).toEqual(validProfile.updatedAt);
      expect(profile.deletedAt).toBe(validProfile.deletedAt);
    });

    it('should handle deleted profile from persistence', () => {
      const deletedProfile = { ...validProfile, deletedAt: new Date() };

      const profile = ProfileEntity.fromPersistence(deletedProfile);

      expect(profile.deletedAt).toEqual(deletedProfile.deletedAt);
    });
  });

  describe('toBasic', () => {
    it('should return basic profile data', () => {
      const profile = ProfileEntity.create(validProfileBasic);
      const basic = profile.toBasic();

      expect(basic).toEqual({
        userId: validProfileBasic.userId,
        username: validProfileBasic.username,
        avatarUrl: validProfileBasic.avatarUrl,
        coverPhotoUrl: validProfileBasic.coverPhotoUrl,
        typePrivacy: validProfileBasic.typePrivacy,
        bio: validProfileBasic.bio,
      });
    });
  });

  describe('updateProfile', () => {
    let profile: ProfileEntity;

    beforeEach(() => {
      profile = ProfileEntity.create(validProfileBasic);
    });

    it('should update username', () => {
      profile.updateProfile({ username: 'newusername' });

      expect(profile.username).toBe('newusername');
    });

    it('should update bio', () => {
      profile.updateProfile({ bio: 'New bio content' });

      expect(profile.bio).toBe('New bio content');
    });

    it('should update privacy type', () => {
      profile.updateProfile({ typePrivacy: Privacy.PRIVATE });

      expect(profile.typePrivacy).toBe(Privacy.PRIVATE);
    });

    it('should update avatar with relative URL', () => {
      profile.updateProfile({ avatarUrl: '/uploads/profile/new-avatar.jpg' });

      expect(profile.avatarUrl).toBe('/uploads/profile/new-avatar.jpg');
    });

    it('should update avatar with absolute URL', () => {
      profile.updateProfile({ avatarUrl: 'https://example.com/new-avatar.jpg' });

      expect(profile.avatarUrl).toBe('https://example.com/new-avatar.jpg');
    });

    it('should set avatar URL to null', () => {
      profile.updateProfile({ avatarUrl: null });

      expect(profile.avatarUrl).toBeNull();
    });

    it('should update cover with relative URL', () => {
      profile.updateProfile({ coverPhotoUrl: '/uploads/profile/new-avatar.jpg' });

      expect(profile.coverPhotoUrl).toBe('/uploads/profile/new-avatar.jpg');
    });

    it('should to fail if the relative url cover foto is invalid', () => {
      expect(() =>
        profile.updateProfile({
          coverPhotoUrl: '/uploads/../../../../profile/new-avatar.jpg',
        }),
      ).toThrow(InvalidPathError);
    });

    it('should to fail if the relative url avatar foto is invalid', () => {
      expect(() =>
        profile.updateProfile({
          avatarUrl: '/uploads/../../../../profile/new-avatar.jpg',
        }),
      ).toThrow(InvalidPathError);
    });

    it('should to fail if the absolute url avatar foto is invalid', () => {
      expect(() =>
        profile.updateProfile({
          avatarUrl: 'http://example.com/new-cover.jpg',
        }),
      ).toThrow(InvalidUrlError);
    });

    it('should to fail if the absolute url cover foto is invalid', () => {
      expect(() =>
        profile.updateProfile({
          coverPhotoUrl: 'http://example.com/new-cover.jpg',
        }),
      ).toThrow(InvalidUrlError);
    });

    it('should update cover photo with absolute URL', () => {
      profile.updateProfile({ coverPhotoUrl: 'https://example.com/new-cover.jpg' });

      expect(profile.coverPhotoUrl).toBe('https://example.com/new-cover.jpg');
    });

    it('should update multiple fields at once', () => {
      profile.updateProfile(updateData);

      expect(profile.username).toBe(updateData.username);
      expect(profile.bio).toBe(updateData.bio);
      expect(profile.typePrivacy).toBe(updateData.typePrivacy);
      expect(profile.avatarUrl).toBe(updateData.avatarUrl);
      expect(profile.coverPhotoUrl).toBe(updateData.coverPhotoUrl);
    });

    it('should throw error for invalid username update', () => {
      expect(() => profile.updateProfile({ username: 'ab' })).toThrow(InvalidUsernameError);
    });
  });

  describe('softDelete', () => {
    it('should soft delete profile', () => {
      const profile = ProfileEntity.create(validProfileBasic);
      const initialUpdatedAt = profile.updatedAt;

      profile.softDelete();

      expect(profile.deletedAt).toBeInstanceOf(Date);
      expect(profile.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime());
    });

    it('should throw error if profile is already deleted', () => {
      const profile = ProfileEntity.create(validProfileBasic);
      profile.softDelete();

      expect(() => profile.softDelete()).toThrow('Profile already deleted');
    });
  });

  describe('restore', () => {
    it('should restore soft deleted profile', () => {
      const profile = ProfileEntity.create(validProfileBasic);
      profile.softDelete();
      const initialUpdatedAt = profile.updatedAt;

      profile.restore();

      expect(profile.deletedAt).toBeNull();
      expect(profile.updatedAt.getTime()).toBeGreaterThanOrEqual(initialUpdatedAt.getTime());
    });

    it('should throw error if profile is not deleted', () => {
      const profile = ProfileEntity.create(validProfileBasic);

      expect(() => profile.restore()).toThrow('Profile is not deleted');
    });
  });

  describe('isPublic', () => {
    it('should return true for public profile', () => {
      const profile = ProfileEntity.create({
        ...validProfileBasic,
        typePrivacy: Privacy.PUBLIC,
      });

      expect(profile.isPublic()).toBe(true);
    });

    it('should return false for private profile', () => {
      const profile = ProfileEntity.create({
        ...validProfileBasic,
        typePrivacy: Privacy.PRIVATE,
      });

      expect(profile.isPublic()).toBe(false);
    });
  });

  describe('isPrivate', () => {
    it('should return true for private profile', () => {
      const profile = ProfileEntity.create({
        ...validProfileBasic,
        typePrivacy: Privacy.PRIVATE,
      });

      expect(profile.isPrivate()).toBe(true);
    });

    it('should return false for public profile', () => {
      const profile = ProfileEntity.create({
        ...validProfileBasic,
        typePrivacy: Privacy.PUBLIC,
      });

      expect(profile.isPrivate()).toBe(false);
    });
  });

  describe('getters', () => {
    it('should return the profile from persistence', () => {
      const profile = ProfileEntity.fromPersistence(validProfile);

      expect(profile.userId).toBe(validProfile.userId);
      expect(profile.username).toBe(validProfile.username);
      expect(profile.avatarUrl).toBe(validProfile.avatarUrl);
      expect(profile.coverPhotoUrl).toBe(validProfile.coverPhotoUrl);
      expect(profile.typePrivacy).toBe(validProfile.typePrivacy);
      expect(profile.bio).toBe(validProfile.bio);
      expect(profile.createdAt).toEqual(validProfile.createdAt);
      expect(profile.updatedAt).toEqual(validProfile.updatedAt);
      expect(profile.deletedAt).toBe(validProfile.deletedAt);
    });
  });
});
