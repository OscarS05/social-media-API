import { InjectRepository } from '@nestjs/typeorm';
import { IAuthRepository } from '../../../../domain/repositories/auth.repository';
import { Auth, Auth as AuthOrm } from '../entites/auth.orm-entity';
import { Repository } from 'typeorm';
import { AuthEntity } from '../../../../domain/entities/auth.entity';
import { AuthMapper } from '../../../mappers/auth.mapper';
import { AuthProvider } from '../../../../domain/enums/providers.enum';

export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(AuthOrm)
    private readonly ormRepo: Repository<AuthOrm>,
  ) {}

  async findByProviderId(
    provider: AuthProvider,
    providerUserId: string,
  ): Promise<AuthEntity | null> {
    const result: Auth | null = await this.ormRepo.findOne({
      where: { provider, providerUserId },
      relations: ['user'],
    });

    if (!result) return null;

    return AuthMapper.toDomain(result);
  }

  async findByEmail(email: string): Promise<AuthEntity | null> {
    const result = await this.ormRepo.findOne({ where: { email }, relations: ['user'] });
    if (!result) return null;

    return AuthMapper.toDomain(result);
  }

  async createAuth(authData: AuthEntity): Promise<AuthEntity | null> {
    const ormAuth: AuthOrm = AuthMapper.toOrm(authData);
    const createAuth: AuthOrm | null = this.ormRepo.create(ormAuth);
    const savedAuth: AuthOrm | null = await this.ormRepo.save(createAuth);

    if (!savedAuth) return null;

    return AuthMapper.toDomain(savedAuth);
  }
}
