import type { UserEntity } from '../entities/user.entity';

export interface createUserPort {
  execute(name: string): Promise<UserEntity>;
}
