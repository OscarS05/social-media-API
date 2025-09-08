import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { UserEntity } from '../../domain/entities/user.entity';
import { RegisterUserUseCase } from '../../application/use-cases/Register-user.usecase';
import { GenerateTokensUseCase } from '../../application/use-cases/generate-tokens.usecase';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { User } from '../../../users/infrastructure/persistence/db/entities/user.orm-entity';
import { mapDomainErrorToHttp } from '../mappers/error.mapper';
import { RegisterUserWithGoogleUseCase } from '../../application/use-cases/register-user-with-google.usecase';
import { GoogleProvider } from '../../domain/services/googleProvider.service';
import { RegisterUserWithFacebookUseCase } from '../../application/use-cases/register-user-with-facebook.usecase';
import { FacebookProvider } from '../../domain/services/facebookProvider.service';
import { UserWrapperResponseDto } from '../../../users/infrastructure/dtos/user.dto';

@Controller('auth')
@ApiExtraModels(User)
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly generateTokens: GenerateTokensUseCase,
    private readonly registerUserWithGoogle: RegisterUserWithGoogleUseCase,
    private readonly registerUserWithFacebook: RegisterUserWithFacebookUseCase,
  ) {}

  @ApiOperation({
    summary: 'Login with local strategy',
    description: 'Login with local strategy',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Information about the logged user',
    type: UserWrapperResponseDto,
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
    type: UserWrapperResponseDto,
  })
  @Post('register')
  async register(@Body() body: RegisterDto) {
    try {
      return await this.registerUseCase.execute(body.name, body.email, body.password);
    } catch (error) {
      throw mapDomainErrorToHttp(error as Error);
    }
  }

  @ApiOperation({
    summary: 'Register/Login the user with Google strategy',
    description: 'Redirect to Google authentication screen',
  })
  @ApiResponse({
    status: 302,
    description: 'User was redirected to Google authentication screen',
  })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @ApiOperation({
    summary: 'Register/Login in to the app after the user has authenticated with Google',
    description:
      'Once the user has authenticated, the application validates the data returned by Google for login or register.',
  })
  @ApiResponse({
    description: 'User was created or logged',
    status: 200,
    type: UserWrapperResponseDto,
  })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request) {
    try {
      const { user } = await this.registerUserWithGoogle.execute(
        req.user as GoogleProvider,
      );
      return {
        message: 'Google login success',
        user,
      };
    } catch (error) {
      throw mapDomainErrorToHttp(error as Error);
    }
  }

  @ApiOperation({
    summary: 'Register/Login the user with Facebook strategy',
    description: 'Redirect to Facebook authentication screen',
  })
  @ApiResponse({
    status: 302,
    description: 'User was redirected to Facebook authentication screen',
  })
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {}

  @ApiOperation({
    summary:
      'Register/Login in to the app after the user has authenticated with Facebook',
    description:
      'Once the user has authenticated, the application validates the data returned by Facebook for login or register.',
  })
  @ApiResponse({
    description: 'User was created or logged',
    status: 200,
    type: UserWrapperResponseDto,
  })
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginCallback(@Req() req: Request) {
    const { user } = await this.registerUserWithFacebook.execute(
      req.user as FacebookProvider,
    );
    return {
      message: 'Facebook login successful',
      user,
    };
  }
}
