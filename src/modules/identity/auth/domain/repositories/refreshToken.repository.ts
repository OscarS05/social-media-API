import {
  DbResponseToUpdate,
  UpdateRefreshTokenDto,
} from '../dtos/updateRefreshToken.dto';
import { RefreshTokenEntity } from '../entities/refreshToken.entity';

export interface IRefreshTokenRepository {
  create(refreshTokenEntity: RefreshTokenEntity): Promise<RefreshTokenEntity>;

  update(
    refreshTokenId: string,
    changes: UpdateRefreshTokenDto,
  ): Promise<DbResponseToUpdate>;

  updateByUserId(
    userId: string,
    changes: UpdateRefreshTokenDto,
  ): Promise<DbResponseToUpdate>;

  findByIdAndUserId(tokenId: string, userId: string): Promise<RefreshTokenEntity>;

  findAllByUserId(userId: string): Promise<RefreshTokenEntity[] | []>;
}
