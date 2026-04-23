import { ProfileEntity } from '../entities/profile.entity';
import { UpdateProfileData } from '../types/profile';

export abstract class ProfileRepository {
  abstract findByUserId(userId: string): Promise<ProfileEntity | null>;
  abstract findByUserName(username: string): Promise<ProfileEntity | null>;
  abstract create(data: ProfileEntity): Promise<ProfileEntity>;
  abstract update(userId: string, changes: UpdateProfileData): Promise<ProfileEntity>;
  abstract delete(userId: string): Promise<void>;
}
