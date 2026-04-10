import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { User } from './entities/user.orm-entity';
import { UserMapper } from '../../mappers/user.mapper';

export class UserRepository implements IUserRepository {
  constructor(@InjectRepository(User) private readonly ormRepo: Repository<User>) {}

  async createUser(userData: UserEntity): Promise<UserEntity> {
    const ormUser: User = UserMapper.toOrm(userData);
    const newUser: User = this.ormRepo.create(ormUser);
    const savedUser: User = await this.ormRepo.save(newUser);

    return UserMapper.toDomain(savedUser);
  }
}
