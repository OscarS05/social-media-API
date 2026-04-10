import { Roles } from '../enums/roles.enum';

export type SessionDataVerified = {
  refreshTokenId: string;
  userId: string;
  role: Roles;
};
