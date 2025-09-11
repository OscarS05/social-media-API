import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { IpAddressService } from '../../../domain/services/ipAddress.service';
import type {
  UserAgentParsed,
  UserAgentService,
} from '../../../domain/services/userAgent.service';
import type { IUuidService } from '../../../domain/services/uuid.service';
import type { IHasherService } from '../../../domain/services/password-hasher.service';
import type {
  IJwtService,
  PayloadRefreshToken,
} from '../../../domain/services/jwt.service';
import type { IRefreshTokenRepository } from '../../../domain/repositories/refreshToken.repository';
import { InvalidIPAddressError } from '../../../domain/errors/refreshToken.errors';
import { UserAgentVO } from '../../../domain/value-objects/userAgent.vo';
import { RefreshTokenEntity } from '../../../domain/entities/refreshToken.entity';
import { Env } from '../../../../../../shared/config/env.model';

@Injectable()
export class CreateRefreshTokenUseCase {
  constructor(
    @Inject('IpAddressService') private ipAddressService: IpAddressService,
    @Inject('UserAgentService') private userAgentService: UserAgentService,
    @Inject('IUuidService') private uuidService: IUuidService,
    @Inject('IHasherService') private hasherService: IHasherService,
    @Inject('IRefreshTokenRepository')
    private refreshTokenRepository: IRefreshTokenRepository,
    @Inject('JwtService') private jwtService: IJwtService,
    private configService: ConfigService<Env>,
  ) {}

  public async execute(
    userId: string,
    userAgent: string,
    ip: string,
  ): Promise<{ refreshToken: string }> {
    const ipParsed: string = this.validateIp(ip);
    const userAgentParsed: UserAgentParsed = this.validateUserAgent(userAgent);
    const { refreshTokenEntity, refreshTokenJwt } = await this.prepareDataToCreate(
      userId,
      userAgentParsed,
      ipParsed,
    );
    await this.createTokenInDB(refreshTokenEntity);

    return { refreshToken: refreshTokenJwt };
  }

  private validateIp(ip: string): string {
    const isValid = this.ipAddressService.isValid(ip);
    if (!isValid) throw new InvalidIPAddressError();

    return this.ipAddressService.normalize(ip);
  }

  private validateUserAgent(userAgent: string): UserAgentParsed {
    const userAgentVO = new UserAgentVO(userAgent).get();
    return this.userAgentService.parse(userAgentVO);
  }

  private async prepareDataToCreate(
    userId: string,
    userAgent: UserAgentParsed,
    ip: string,
  ): Promise<{ refreshTokenEntity: RefreshTokenEntity; refreshTokenJwt: string }> {
    const refreshTokenId = this.uuidService.generateId();

    const payload: PayloadRefreshToken = { sub: userId, jti: refreshTokenId };
    const refreshTokenJwt = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('REFRESH_EXPIRES_IN', { infer: true }),
      secret: this.configService.get('REFRESH_SECRET', { infer: true }),
    });

    const roundsHash = Number(
      this.configService.get('ROUNDS_HASH_PASSWORD', { infer: true }),
    );
    const refreshTokenHashed = await this.hasherService.hash(refreshTokenJwt, roundsHash);

    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + 30);

    const refreshTokenEntity = new RefreshTokenEntity(
      refreshTokenId,
      userId,
      refreshTokenHashed,
      userAgent,
      ip,
      false,
      expiresAt,
      new Date(),
      new Date(),
    );

    return {
      refreshTokenEntity,
      refreshTokenJwt,
    };
  }

  private async createTokenInDB(
    refreshTokenEntity: RefreshTokenEntity,
  ): Promise<RefreshTokenEntity> {
    const result: RefreshTokenEntity | null =
      await this.refreshTokenRepository.create(refreshTokenEntity);

    if (!result) throw new InternalServerErrorException();

    return result;
  }
}
