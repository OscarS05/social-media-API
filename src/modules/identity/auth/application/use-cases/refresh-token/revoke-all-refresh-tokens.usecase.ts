import { Inject, Injectable } from '@nestjs/common';
import type { IRefreshTokenRepository } from '../../../domain/repositories/refreshToken.repository';
import { DbResponseToUpdate } from '../../../domain/dtos/updateRefreshToken.dto';

@Injectable()
export class RevokeAllRefreshTokensUseCase {
  constructor(
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  public async execute(userId: string): Promise<{ refreshTokensRevoked: number }> {
    const result: DbResponseToUpdate = await this.refreshTokenRepo.updateByUserId(
      userId,
      { revoked: true },
    );
    return { refreshTokensRevoked: result.affected as number };
  }
}
