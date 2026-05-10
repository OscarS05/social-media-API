import { Response } from 'express';

type NAME_COOKIE = 'refreshToken' | 'accessToken';

export const setCookie = (res: Response, name: NAME_COOKIE, token: string): void => {
  res.cookie(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: parseInt(process.env.REFRESH_EXPIRES_IN || '86400'),
  });
};

export const clearCookie = (res: Response, name: string): void => {
  res.clearCookie(name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};
