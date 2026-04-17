import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { PayloadRefreshToken, PayloadAccessToken } from '../../../domain/types/session';
import { InvalidTokenError } from '../../../domain/errors/auth.errors';
import { TokenService } from '../../../domain/services/token.service';

@Injectable()
export class JwtTokenService extends TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  public accessToken(payloadData: PayloadAccessToken): string {
    return this.jwtService.sign(payloadData, {
      secret: this.configService.get('ACCESS_SECRET'),
      expiresIn: this.configService.get('ACCESS_EXPIRES_IN'),
    });
  }

  public refreshToken(payloadData: PayloadRefreshToken): string {
    return this.jwtService.sign(payloadData, {
      secret: this.configService.get('REFRESH_SECRET'),
      expiresIn: this.configService.get('REFRESH_EXPIRES_IN'),
    });
  }

  public verifyAccessToken(token: string): PayloadAccessToken {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('ACCESS_SECRET'),
      });
    } catch {
      throw new InvalidTokenError('Invalid token');
    }
  }

  public verifyRefreshToken(token: string): PayloadRefreshToken {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('REFRESH_SECRET'),
      });
    } catch {
      throw new InvalidTokenError('Invalid token');
    }
  }

  public getRefreshTokenExpiration(): Date {
    const expiresIn = this.configService.get<string>('REFRESH_EXPIRES_IN') || '86400';
    const expiresInSeconds = parseInt(expiresIn, 10);
    return new Date(Date.now() + expiresInSeconds * 1000);
  }

  public decode(token: string): PayloadAccessToken | PayloadRefreshToken {
    try {
      return this.jwtService.decode(token);
    } catch {
      throw new InvalidTokenError('Invalid token');
    }
  }
}
