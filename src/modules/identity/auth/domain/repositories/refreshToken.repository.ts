import { UpdateRefreshToken } from '../dtos/updateRefreshToken.dto';
import { RefreshTokenEntity } from '../entities/refreshToken.entity';

export interface IRefreshTokenRepository {
  create(refreshTokenEntity: RefreshTokenEntity): Promise<RefreshTokenEntity | null>;

  update(
    refreshTokenId: string,
    changes: UpdateRefreshToken,
  ): Promise<RefreshTokenEntity | null>;

  findByIdAndUserId(tokenId: string, userId: string): Promise<RefreshTokenEntity | null>;
}
