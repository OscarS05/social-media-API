export interface UserEntity {
  id: string;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
