export type OAuthProfile = {
  name: string;
  email: string;
  providerId: string;
  avatar?: string | null;
};

export type UserOAuth = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};
