import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type {
  IJwtService,
  PayloadRefreshToken,
} from '../../../domain/services/jwt.service';
import type { IRefreshTokenRepository } from '../../../domain/repositories/refreshToken.repository';
import type { IHasherService } from '../../../domain/services/password-hasher.service';
import { Env } from '../../../../../../shared/config/env.model';
import { RefreshTokenEntity } from '../../../domain/entities/refreshToken.entity';
import { InvalidTokenError } from '../../../domain/errors/refreshToken.errors';
import { UpdateRefreshTokenDto } from '../../../domain/dtos/updateRefreshToken.dto';

@Injectable()
export class RevokeRefreshTokenUseCase {
  constructor(
    @Inject('JwtService') private readonly jwtService: IJwtService,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepo: IRefreshTokenRepository,
    @Inject('IHasherService') private readonly hasherService: IHasherService,
    private readonly configService: ConfigService<Env>,
  ) {}

  async execute(refreshToken: string): Promise<{ revokeResult: true }> {
    const payload: PayloadRefreshToken = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('REFRESH_SECRET', { infer: true }),
    });

    const refreshTokenInDb: RefreshTokenEntity =
      await this.refreshTokenRepo.findByIdAndUserId(payload.jti, payload.sub);

    await this.compareTokens(refreshTokenInDb.getTokenHashed, refreshToken);
    await this.revokeToken(refreshTokenInDb.getId, { revoked: true });
    return { revokeResult: true };
  }

  private async compareTokens(
    tokenHashedInDb: string,
    tokenInput: string,
  ): Promise<boolean> {
    const isMatch = await this.hasherService.compare(tokenInput, tokenHashedInDb);
    if (!isMatch) throw new InvalidTokenError();
    return isMatch;
  }

  private async revokeToken(id: string, changes: UpdateRefreshTokenDto): Promise<void> {
    const result = await this.refreshTokenRepo.update(id, changes);
    if (result?.affected === 0) throw new InternalServerErrorException();
  }
}
