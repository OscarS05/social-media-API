import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-facebook';
import { Injectable } from '@nestjs/common';
import passport, { DoneCallback } from 'passport';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: `${process.env.URL_CLIENT}:${process.env.PORT}/auth/facebook/callback`,
      scope: ['email'],
      profileFields: ['id', 'email', 'name'],
    } as StrategyOptions);
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: passport.Profile,
    done: DoneCallback,
  ): any {
    const user = {
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      name: `${profile.name?.givenName} ${profile.name?.middleName} ${profile.name?.familyName}`,
    };
    done(null, user);
  }
}
