import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { LoginUseCase } from '../../../application/use-cases/Login.usecase';
import { LoginDto } from '../../dtos/auth.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private loginUseCase: LoginUseCase) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    const user = await this.loginUseCase.execute(email, password);
    return user;
  }
}
