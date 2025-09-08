import { PassportStrategy } from '@nestjs/passport';
import {
  _StrategyOptionsBase,
  Profile,
  Strategy,
  VerifyCallback,
} from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:${process.env.PORT}/auth/google/callback`,
      scope: ['email', 'profile'],
    } as _StrategyOptionsBase);
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): any {
    const user = {
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      isVerified: profile.emails?.[0]?.verified,
      name: profile.displayName,
      avatar: profile.photos?.[0]?.value,
    };
    done(null, user);
  }
}
