import { InjectRepository } from '@nestjs/typeorm';

import { RefreshTokenEntity } from '../../../../domain/entities/refreshToken.entity';
import { IRefreshTokenRepository } from '../../../../domain/repositories/refreshToken.repository';
import { RefreshToken as RefreshTokenEntityOrm } from '../entites/refresh-tokens.orm-entity';
import { RefreshTokenMapper } from '../../../mappers/refresh-token.mapper';
import { Repository } from 'typeorm';

export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntityOrm)
    private readonly ormRepo: Repository<RefreshTokenEntityOrm>,
  ) {}

  async create(
    refreshTokenEntity: RefreshTokenEntity,
  ): Promise<RefreshTokenEntity | null> {
    const ormEntity: RefreshTokenEntityOrm = RefreshTokenMapper.toOrm(refreshTokenEntity);
    const createdEntity = this.ormRepo.create(ormEntity);
    const savedEntity = await this.ormRepo.save(createdEntity);

    if (!savedEntity) return null;

    return RefreshTokenMapper.toDomain(savedEntity);
  }
}
