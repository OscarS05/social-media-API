import { Privacy } from '../enums/privacy.enum';

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

export type UpdateProfileData = Partial<
  Omit<Profile, 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>
>;
