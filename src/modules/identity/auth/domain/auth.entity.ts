export interface AuthEntity {
  id: string;
  userId: string;
  email?: string | null;
  password?: string | null;
  provider: string;
  providerUserId?: string | null;
  resetToken?: string | null;
  isVerified: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
