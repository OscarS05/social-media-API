import { RefreshTokenEntity } from '../entities/refreshToken.entity';

export interface IRefreshTokenRepository {
  create(refreshTokenEntity: RefreshTokenEntity): Promise<RefreshTokenEntity>;
}
