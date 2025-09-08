import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-strategy';

@Injectable()
export class MockFacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super();
  }

  authenticate(req: { path?: string; url?: string }) {
    // Simulate the OAuth redirect for the initial endpoint
    const path: string | undefined = req?.path ?? req?.url;
    if (typeof path === 'string' && path.endsWith('/auth/facebook')) {
      this.redirect('/auth/facebook/callback');
      return;
    }

    // Simulate successful authentication for the callback endpoint
    const fakeUser = {
      providerId: 'facebook-123',
      email: 'admin@test.com',
      isVerified: true,
      name: 'test admin',
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
