import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { UserEntity } from '../../../../domain/entities/user.entity';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import { User as UserORM } from '../entites/user.orm-entity';
import { UserMapper } from '../../../mappers/user.mapper';
import { AuthProvider } from '../../../../domain/enums/providers.enum';
import { transactionStorage } from '../../../../../../shared/services/transaction/transaction-context';

export class UserRepositoryORM extends UserRepository {
  constructor(@InjectRepository(UserORM) private readonly ormRepo: Repository<UserORM>) {
    super();
  }

  private get repo(): Repository<UserORM> {
    const manager = transactionStorage.getStore();
    return manager ? manager.getRepository(UserORM) : this.ormRepo;
  }

  async createUser(userData: UserEntity): Promise<UserEntity> {
    const ormUser: UserORM = UserMapper.toOrm(userData);
    const newUser: UserORM = await this.repo.save(ormUser);
    return UserMapper.toDomain(newUser);
  }

  async findByProviderId(
    provider: AuthProvider,
    providerId: string,
  ): Promise<UserEntity | null> {
    const result: UserORM | null = await this.repo.findOne({
      where: { provider, providerId, deletedAt: IsNull() },
    });

    if (!result) return null;

    return UserMapper.toDomain(result);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result: UserORM | null = await this.repo.findOne({
      where: { email, deletedAt: IsNull() },
    });
    if (!result) return null;

    return UserMapper.toDomain(result);
  }
}
