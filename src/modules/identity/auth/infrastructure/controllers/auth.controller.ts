import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { LoginUseCase } from '../../application/use-cases/Login.usecase';
import { RegisterUserUseCase } from '../../application/use-cases/Register-user.usecase';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUserUseCase,
  ) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  login(@Body() body: LoginDto) {
    return this.loginUseCase.execute(body.email, body.password);
  }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.registerUseCase.execute(body.name, body.email, body.password);
  }
}
