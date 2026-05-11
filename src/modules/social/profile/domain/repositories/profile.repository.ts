import {
  PaginationRequest,
  PaginationResponse,
} from '../../../../../shared/domain/types/pagination.type';
import { ProfileEntity } from '../entities/profile.entity';
import {
  ProfileAccessContext,
  ProfileData,
  ProfilePreview,
  UpdateProfileData,
} from '../types/profile';

export abstract class ProfileRepository {
  abstract findByUserId(userId: string): Promise<ProfileEntity | null>;

  abstract findByUserName(username: string): Promise<ProfileEntity | null>;

  abstract findUsernames(
    username: string,
    options: PaginationRequest,
  ): Promise<PaginationResponse<string>>;

  abstract create(data: ProfileEntity): Promise<ProfileEntity>;

  abstract update(userId: string, changes: UpdateProfileData): Promise<ProfileEntity>;

  abstract delete(userId: string): Promise<void>;

  abstract findAllProfilesByUsername(
    username: string,
    options: PaginationRequest,
  ): Promise<PaginationResponse<ProfilePreview>>;

  abstract getProfileAccessContext(
    viewerId: string,
    ownerId: string,
  ): Promise<ProfileAccessContext>;

  abstract getProfileBaseView(userId: string): Promise<ProfileData | null>;
}
