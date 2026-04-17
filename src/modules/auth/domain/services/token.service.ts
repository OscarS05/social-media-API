import { PayloadAccessToken, PayloadRefreshToken } from '../types/session';

export abstract class TokenService {
  abstract accessToken(payloadData: PayloadAccessToken): string;
  abstract refreshToken(payloadData: PayloadRefreshToken): string;
  abstract verifyAccessToken(token: string): PayloadAccessToken;
  abstract verifyRefreshToken(token: string): PayloadRefreshToken;
  abstract getRefreshTokenExpiration(): Date;
  abstract decode(token: string): PayloadAccessToken | PayloadRefreshToken;
}
