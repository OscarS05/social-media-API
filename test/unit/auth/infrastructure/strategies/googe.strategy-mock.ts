import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-strategy';
import { EMAIL_OAUTH_GOOGLE, PROVIDER_ID } from '../../../../factories/user.factory';

@Injectable()
export class MockGoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super();
  }

  authenticate(req: { path?: string; url?: string }) {
    // Simulate the OAuth redirect for the initial endpoint
    const path: string | undefined = req?.path ?? req?.url;
    if (typeof path === 'string' && path.endsWith('/auth/google')) {
      this.redirect('/auth/google/callback');
      return;
    }

    // Simulate successful authentication for the callback endpoint
    const fakeUser = {
      providerId: PROVIDER_ID,
      email: EMAIL_OAUTH_GOOGLE,
      isVerified: true,
      name: 'test google user',
      avatar: 'http://avatar.example.com/fake.png',
    };
    this.success(fakeUser);
  }

  // Required by PassportStrategy mixin; not used in this mock
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(...args: any[]): any {
    return null;
  }
}
