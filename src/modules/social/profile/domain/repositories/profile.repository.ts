import { ProfileEntity } from '../entities/profile.entity';
import {
  ProfileAccessContext,
  ProfilePreview,
  ProfileView,
  ProfileViewOptions,
  UpdateProfileData,
} from '../types/profile';

export abstract class ProfileRepository {
  abstract findByUserId(userId: string): Promise<ProfileEntity | null>;
  abstract findByUserName(username: string): Promise<ProfileEntity | null>;
  abstract findUsernames(username: string): Promise<string[]>;
  abstract create(data: ProfileEntity): Promise<ProfileEntity>;
  abstract update(userId: string, changes: UpdateProfileData): Promise<ProfileEntity>;
  abstract delete(userId: string): Promise<void>;

  abstract findAllProfilesByUsername(username: string): Promise<ProfilePreview[]>;
  abstract getProfileAccessContext(
    viewerId: string,
    ownerId: string,
  ): Promise<ProfileAccessContext | null>;
  abstract getProfileViewByUserId(
    userId: string,
    options?: ProfileViewOptions,
  ): Promise<ProfileView>;
}
