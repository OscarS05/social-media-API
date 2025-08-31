import { AuthEntity } from '../entities/auth.entity';

export interface IAuthRepository {
  findByEmail(email: string): Promise<AuthEntity | null>;
}
