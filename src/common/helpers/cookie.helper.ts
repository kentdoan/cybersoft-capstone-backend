import { Response } from 'express';

const COOKIE_OPTIONS = { httpOnly: true, sameSite: 'lax' as const, secure: false };

export const storeCookies = (res: Response, access_token: string, refresh_token: string) => {
  res.cookie('accessToken', access_token, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refresh_token, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

export const clearCookies = (res: Response) => {
  res.clearCookie('accessToken', COOKIE_OPTIONS);
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
};
