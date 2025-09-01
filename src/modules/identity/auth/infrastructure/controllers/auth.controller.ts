import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import type { Request } from 'express';
import type { UserEntity } from '../../domain/entities/user.entity';
import { LoginUseCase } from '../../application/use-cases/Login.usecase';
import { RegisterUserUseCase } from '../../application/use-cases/Register-user.usecase';
import { RegisterDto } from '../dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUserUseCase,
  ) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(AuthGuard('local'))
  login(@Req() req: Request) {
    const user = req.user as UserEntity;
    return {
      ...user,
    };
  }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.registerUseCase.execute(body.name, body.email, body.password);
  }
}
