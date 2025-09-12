import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type {
  IJwtService,
  PayloadRefreshToken,
} from '../../../domain/services/jwt.service';
import type { IHasherService } from '../../../domain/services/password-hasher.service';
import type { IRefreshTokenRepository } from '../../../domain/repositories/refreshToken.repository';
import { SessionDataVerified } from '../../../domain/dtos/verifiedSession.dto';
import { Env } from '../../../../../../shared/config/env.model';
import { RefreshTokenEntity } from '../../../domain/entities/refreshToken.entity';
import { UpdateRefreshTokenDto } from '../../../domain/dtos/updateRefreshToken.dto';

@Injectable()
export class UpdateRefreshTokenUseCase {
  constructor(
    @Inject('JwtService') private readonly jwtService: IJwtService,
    @Inject('IHasherService') private readonly hasherService: IHasherService,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepo: IRefreshTokenRepository,
    private readonly configService: ConfigService<Env>,
  ) {}

  async execute(
    sessionDataVerified: SessionDataVerified,
  ): Promise<{ refreshToken: string }> {
    const newRefreshToken: string = this.createNewToken(
      sessionDataVerified.refreshTokenId,
      sessionDataVerified.userId,
    );

    const updateRefreshTokenDto: UpdateRefreshTokenDto =
      await this.prepareData(newRefreshToken);

    await this.updateInDb(sessionDataVerified.refreshTokenId, updateRefreshTokenDto);

    return { refreshToken: newRefreshToken };
  }

  private createNewToken(id: string, userId: string): string {
    const payload: PayloadRefreshToken = {
      jti: id,
      sub: userId,
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('REFRESH_EXPIRES_IN', { infer: true }),
      secret: this.configService.get('REFRESH_SECRET', { infer: true }),
    });
  }

  private async prepareData(newRefreshToken: string): Promise<UpdateRefreshTokenDto> {
    const tokenHashed: string = await this.hasherService.hash(
      newRefreshToken,
      this.configService.get('ROUNDS_HASH_PASSWORD', { infer: true }) ?? 10,
    );

    const now = new Date();
    const expiration = now.setDate(new Date().getDate() + 30);

    return {
      tokenHashed,
      revoked: false,
      expiresAt: new Date(expiration),
      updatedAt: new Date(),
    };
  }

  private async updateInDb(
    refreshTokenId: string,
    updateRefreshTokenDto: UpdateRefreshTokenDto,
  ): Promise<RefreshTokenEntity> {
    const result: RefreshTokenEntity | null = await this.refreshTokenRepo.update(
      refreshTokenId,
      updateRefreshTokenDto,
    );

    if (!result) throw new InternalServerErrorException();

    return result;
  }
}
