import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import type { UserEntity } from '../../domain/entities/user.entity';
import { RegisterUserUseCase } from '../../application/use-cases/Register-user.usecase';
import { GenerateTokensUseCase } from '../../application/use-cases/generate-tokens.usecase';
import { RegisterDto } from '../dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly generateTokens: GenerateTokensUseCase,
  ) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  login(@Req() req: Request) {
    const user = req.user as UserEntity;
    return {
      ...user,
      accessToken: this.generateTokens.execute(user),
    };
  }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.registerUseCase.execute(body.name, body.email, body.password);
  }
}
