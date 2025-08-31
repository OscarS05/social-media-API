import { InjectRepository } from '@nestjs/typeorm';
import { IAuthRepository } from '../../../domain/repositories/auth.repository';
import { Auth } from './entites/auth.orm-entity';
import { Repository } from 'typeorm';
import { AuthEntity } from '../../../domain/entities/auth.entity';
import { AuthMapper } from '../mappers/auth.mapper';

export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(Auth)
    private readonly ormRepo: Repository<Auth>,
  ) {}

  async findByEmail(email: string): Promise<AuthEntity | null> {
    const result = await this.ormRepo.findOne({ where: { email }, relations: ['user'] });
    if (!result) return null;

    return AuthMapper.toDomain(result);
  }
}
