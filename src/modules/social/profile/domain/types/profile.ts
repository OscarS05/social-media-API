import { Privacy } from '../enums/privacy.enum';
import { PostData } from './posts';

export type Profile = {
  userId: string;
  username: string;
  avatarUrl?: string | null;
  coverPhotoUrl?: string | null;
  typePrivacy: Privacy;
  bio?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export type ProfileBasic = Omit<Profile, 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type CreateProfilData = Omit<Profile, 'createdAt' | 'updatedAt' | 'deletedAt'>;

export type UpdateProfileData = Partial<Omit<Profile, 'createdAt' | 'deletedAt' | 'userId'>>;
export type UpdateProfileInput = Partial<
  Omit<Profile, 'createdAt' | 'deletedAt' | 'updatedAt' | 'userId'>
>;

export type ProfileAccessContext = {
  exists: boolean;
  isBlocked: boolean;
  isFollowing: boolean; // viewer → owner
  isFollower: boolean; // owner → viewer
  isPrivate: boolean;
};

export type ProfileView = {
  profile: Profile;
  relations: {
    followers: number;
    following: number;
  };
  posts?: PostData[];
};

export type ProfileViewOptions = {
  includePosts?: boolean;
  postsLimit?: number;
  postsCursor?: string;
};

export type ImageData = {
  buffer: Buffer;
  filename: string;
};

export type OAuthProfile = {
  name: string;
  userId: string;
  avatarUrl?: string | null;
};
