export type PayloadRefreshToken = {
  sub: string;
  jti: string;
};

export type PayloadAccessToken = {
  sub: string;
  role: string;
};

export interface IJwtService {
  sign(
    payload: string | PayloadRefreshToken | PayloadAccessToken,
    options?: { secret?: string; expiresIn?: string },
  ): string;
  verify(token: string, options?: { secret?: string }): string;
}
