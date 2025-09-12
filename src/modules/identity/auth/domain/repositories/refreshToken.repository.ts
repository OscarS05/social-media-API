import { RefreshTokenEntity } from '../entities/refreshToken.entity';

export interface IRefreshTokenRepository {
  create(refreshTokenEntity: RefreshTokenEntity): Promise<RefreshTokenEntity | null>;
  findByIdAndUserId(tokenId: string, userId: string): Promise<RefreshTokenEntity | null>;
}
