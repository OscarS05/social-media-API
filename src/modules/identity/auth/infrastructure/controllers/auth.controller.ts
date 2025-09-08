import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { UserEntity } from '../../domain/entities/user.entity';
import { RegisterUserUseCase } from '../../application/use-cases/Register-user.usecase';
import { GenerateTokensUseCase } from '../../application/use-cases/generate-tokens.usecase';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Auth } from '../persistence/db/entites/auth.orm-entity';
import { User } from '../../../users/infrastructure/persistence/db/entities/user.orm-entity';
import { mapDomainErrorToHttp } from '../mappers/error.mapper';
import { RegisterUserWithGoogleUseCase } from '../../application/use-cases/register-user-with-google.usecase';
import { GoogleProvider } from '../../domain/services/googleProvider.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly generateTokens: GenerateTokensUseCase,
    private readonly registerUserWithGoogle: RegisterUserWithGoogleUseCase,
  ) {}

  @ApiOperation({
    summary: 'Login with local strategy',
    description: 'Login with local strategy',
  })
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

  @ApiOperation({
    summary: 'Register with local strategy',
    description: 'User registration creates the user and his/her authentication',
  })
  @ApiResponse({
    status: 201,
    description: 'Information about the saved user',
    type: User,
  })
  @Post('register')
  async register(@Body() body: RegisterDto) {
    try {
      return await this.registerUseCase.execute(body.name, body.email, body.password);
    } catch (error) {
      throw mapDomainErrorToHttp(error as Error);
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request) {
    const { user } = await this.registerUserWithGoogle.execute(
      req.user as GoogleProvider,
    );
    return {
      message: 'Google login success',
      user,
    };
  }
}
