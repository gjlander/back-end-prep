import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';
import type { Response } from 'express';
import { ACCESS_JWT_SECRET, ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from '#config';
import { RefreshToken } from '#models';

type UserData = {
  roles: string[];
  _id: Types.ObjectId;
};

const createTokens = async (userData: UserData): Promise<[string, string]> => {
  // refresh token
  const refreshToken = randomUUID();

  await RefreshToken.create({
    token: refreshToken,
    userId: userData._id
  });

  // access token
  const payload = { roles: userData.roles };
  const secret = ACCESS_JWT_SECRET;
  const tokenOptions = { expiresIn: ACCESS_TOKEN_TTL, subject: userData._id.toString() };

  const accessToken = jwt.sign(payload, secret, tokenOptions);

  return [refreshToken, accessToken];
};

const setAuthCookies = (res: Response, refreshToken: string, accessToken: string) => {
  // set cookies
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    secure: isProduction
  };

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_TTL * 1000 // in milliseconds
  });
  res.cookie('accessToken', accessToken, cookieOptions);
};
export { createTokens, setAuthCookies };
