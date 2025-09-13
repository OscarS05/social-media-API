import { UpdateRefreshTokenDto } from '../dtos/updateRefreshToken.dto';
import { RefreshTokenEntity } from '../entities/refreshToken.entity';

export interface IRefreshTokenRepository {
  create(refreshTokenEntity: RefreshTokenEntity): Promise<RefreshTokenEntity | null>;

  update(
    refreshTokenId: string,
    changes: UpdateRefreshTokenDto,
  ): Promise<RefreshTokenEntity | null>;

  findByIdAndUserId(tokenId: string, userId: string): Promise<RefreshTokenEntity | null>;
}
