import { Inject, Injectable } from '@nestjs/common';

import type { IRefreshTokenRepository } from '../../../domain/repositories/refreshToken.repository';
import { GetRefreshToken } from '../../../domain/dtos/GetRefreshToken.dto';
import { RefreshTokenEntity } from '../../../domain/entities/refreshToken.entity';

@Injectable()
export class FindAllRefreshTokensUseCase {
  constructor(
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  public async execute(
    userId: string,
  ): Promise<{ refreshTokens: GetRefreshToken[] } | { refreshTokens: [] }> {
    const refreshTokens: RefreshTokenEntity[] | [] =
      await this.refreshTokenRepo.findAllByUserId(userId);

    if (refreshTokens.length === 0) return { refreshTokens: [] };

    return {
      refreshTokens: refreshTokens.map((token: RefreshTokenEntity) =>
        token.toPublicObject(),
      ),
    };
  }
}
