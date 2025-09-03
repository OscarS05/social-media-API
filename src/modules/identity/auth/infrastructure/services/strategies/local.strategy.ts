import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginUseCase } from '../../../application/use-cases/Login.usecase';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from '../../dtos/auth.dto';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private loginUseCase: LoginUseCase) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    await this.validateData(email, password);

    const { user } = await this.loginUseCase.execute(email, password);
    return user;
  }

  async validateData(email: string, password: string) {
    const loginDto = plainToInstance(LoginDto, { email, password });
    const errors: ValidationError[] = await validate(loginDto);

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints ?? {})).flat();

      throw new BadRequestException(messages);
    }
  }
}
