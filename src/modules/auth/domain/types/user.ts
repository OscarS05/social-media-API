import { AuthProvider } from '../enums/providers.enum';
import { Roles } from '../enums/roles.enum';

export type UserBasic = {
  id: string;
  name: string;
  email: string;
  role: Roles;
};

export type UserLocal = {
  name: string;
  email: string;
  password: string;
};

export type UserCredentials = Omit<UserLocal, 'name'>;

export type CreateUserData = {
  id: string;
  name: string;
  email: string;
  provider: AuthProvider;
  isVerified: boolean;
  providerId?: string | null;
  password?: string | null;
};

export type UserRawData = {
  id: string;
  name: string;
  role: Roles;
  provider: AuthProvider;
  isVerified: boolean;
  email: string;
  password: string | null;
  providerId: string | null;
  resetToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
