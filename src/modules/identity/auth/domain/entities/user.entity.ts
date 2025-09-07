import { Roles } from '../enums/roles.enum';

export interface UserEntity {
  id: string;
  name: string;
  role: Roles;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
