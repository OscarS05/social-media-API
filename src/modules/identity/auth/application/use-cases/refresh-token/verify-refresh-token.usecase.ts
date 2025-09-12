import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type {
  IJwtService,
  PayloadRefreshToken,
} from '../../../domain/services/jwt.service';
import type { IRefreshTokenRepository } from '../../../domain/repositories/refreshToken.repository';
import type { IHasherService } from '../../../domain/services/password-hasher.service';
import type { IpAddressService } from '../../../domain/services/ipAddress.service';
import type {
  UserAgentParsed,
  UserAgentService,
} from '../../../domain/services/userAgent.service';
import { Env } from '../../../../../../shared/config/env.model';
import { RefreshTokenEntity } from '../../../domain/entities/refreshToken.entity';
import {
  InvalidIPAddressError,
  InvalidTokenError,
  InvalidUserAgentError,
} from '../../../domain/errors/refreshToken.errors';
import { UserAgentVO } from '../../../domain/value-objects/userAgent.vo';
import { SessionDataVerified } from '../../../domain/dtos/verifiedSession.dto';

@Injectable()
export class VerifyRefreshTokenUseCase {
  constructor(
    @Inject('JwtService') private readonly jwtService: IJwtService,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject('IHasherService') private readonly hasherService: IHasherService,
    @Inject('IpAddressService') private readonly ipService: IpAddressService,
    @Inject('UserAgentService') private readonly userAgentService: UserAgentService,
    private readonly configService: ConfigService<Env>,
  ) {}

  async execute(
    refreshToken: string,
    userAgent: string,
    ipAddress: string,
  ): Promise<SessionDataVerified> {
    const payload: PayloadRefreshToken = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('REFRESH_SECRET', { infer: true }),
    });

    const refreshTokenEntity: RefreshTokenEntity = await this.findTokenInDb(
      payload.jti,
      payload.sub,
    );
    refreshTokenEntity.isActive();

    await this.compareTokens(refreshToken, refreshTokenEntity.getTokenHashed);
    this.compareIps(ipAddress, refreshTokenEntity.getIp);
    this.compareUserAgents(userAgent, refreshTokenEntity.getUserAgent);

    return {
      refreshTokenId: refreshTokenEntity.getId,
      userId: payload.sub,
    };
  }

  private async findTokenInDb(
    refreshTokenId: string,
    userId: string,
  ): Promise<RefreshTokenEntity> {
    const result: RefreshTokenEntity | null =
      await this.refreshTokenRepository.findByIdAndUserId(refreshTokenId, userId);

    if (!result) throw new InvalidTokenError('Token not found');

    return result;
  }

  private async compareTokens(
    refreshToken: string,
    tokenHashedInDb: string,
  ): Promise<boolean> {
    const isValid = await this.hasherService.compare(refreshToken, tokenHashedInDb);
    if (!isValid) throw new InvalidTokenError();
    return true;
  }

  private compareIps(ipInput: string, ipInDb: string): string {
    const isIpInputValid = this.ipService.isValid(ipInput);
    if (!isIpInputValid) throw new InvalidIPAddressError();

    const ipInputFormated = this.ipService.normalize(ipInput);
    if (ipInputFormated !== ipInDb) throw new InvalidIPAddressError();

    return ipInputFormated;
  }

  private compareUserAgents(
    userAgentInput: string,
    userAgentInDb: UserAgentParsed,
  ): boolean {
    const userAgentInputVO = new UserAgentVO(userAgentInput).get();
    const userAgentInputParsed = this.userAgentService.parse(userAgentInputVO);

    if (
      userAgentInputParsed.browser.name !== userAgentInDb.browser.name ||
      userAgentInputParsed.device.type !== userAgentInDb.device.type ||
      userAgentInputParsed.device.model !== userAgentInDb.device.model ||
      userAgentInputParsed.device.vendor !== userAgentInDb.device.vendor ||
      userAgentInputParsed.os.name !== userAgentInDb.os.name
    ) {
      throw new InvalidUserAgentError('invalid device');
    }

    return true;
  }
}
