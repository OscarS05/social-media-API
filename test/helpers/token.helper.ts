import { Response } from 'supertest';

export const getTokensFromCookies = (res: Response): string[] => {
  const cookies = res.headers['set-cookie'] as unknown as string[];

  const accessToken =
    cookies
      .find((cookie) => cookie.startsWith('accessToken='))
      ?.split(';')[0]
      .split('=')[1] || '';

  const refreshToken =
    cookies
      .find((cookie) => cookie.startsWith('refreshToken='))
      ?.split(';')[0]
      .split('=')[1] || '';

  return [accessToken, refreshToken];
};
