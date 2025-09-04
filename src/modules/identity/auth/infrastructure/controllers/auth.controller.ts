import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { UserEntity } from '../../domain/entities/user.entity';
import { RegisterUserUseCase } from '../../application/use-cases/Register-user.usecase';
import { GenerateTokensUseCase } from '../../application/use-cases/generate-tokens.usecase';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Auth } from '../persistence/db/entites/auth.orm-entity';
import { User } from '../../../users/infrastructure/persistence/db/entities/user.orm-entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly generateTokens: GenerateTokensUseCase,
  ) {}

  @ApiOperation({ summary: 'Login with local strategy' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Information about the logged user',
    type: Auth,
  })
  @Post('login')
  @UseGuards(AuthGuard('local'))
  @HttpCode(200)
  login(@Req() req: Request) {
    const user = req.user as UserEntity;
    return {
      ...user,
      accessToken: this.generateTokens.execute(user),
    };
  }

  @ApiOperation({ summary: 'Register with local strategy' })
  @ApiResponse({
    status: 201,
    description: 'Information about the saved user',
    type: User,
  })
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.registerUseCase.execute(body.name, body.email, body.password);
  }
}
