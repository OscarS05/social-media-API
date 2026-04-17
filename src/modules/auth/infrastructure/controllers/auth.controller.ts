import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

import { RegisterUserUseCase } from '../../application/use-cases/users/register-with-local.usecase';
import { LoginDto, TokenDto, RegisterDto } from '../dtos/auth.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import { User } from '../persistence/db/entites/user.orm-entity';
import { mapDomainErrorToHttp } from '../mappers/error.mapper';
import { LoginWithOAuthUseCase } from '../../application/use-cases/users/login-with-oauth';
import { RefreshToken } from '../../../../shared/services/decorators/refreshToken.decorator';
import { UserAgent } from '../../../../shared/services/decorators/userAgent.decorators';
import { IpAddress } from '../../../../shared/services/decorators/ipAddress.decorator';
import { UserResponseDto } from '../dtos/user.dto';
import type { UserAgentParsed } from '../../domain/services/userAgent.service';
import { LoginUseCase } from '../../application/use-cases/users/login-local.usecase';
import { LoginResponse } from '../../domain/types/session';
import { OAuthProfile } from '../../domain/types/auth';
import { AuthProvider } from '../../domain/enums/providers.enum';
import { AccessToken } from '../../../../shared/services/decorators/accessToken.decorator';
import { RefreshSessionUseCase } from '../../application/use-cases/session/refresh-session.usecase';
import { setCookie } from '../helpers/cookie.helper';
import { UserBasic } from '../../domain/types/user';

@Controller('auth')
@ApiExtraModels(User)
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly loginWithOAuthUseCase: LoginWithOAuthUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
  ) {}

  @ApiOperation({
    summary: 'Register with local strategy',
    description: 'User registration creates the user without verifying the email',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Information about the saved user',
    type: UserResponseDto,
  })
  @Post('register')
  async register(@Body() body: RegisterDto): Promise<UserBasic> {
    try {
      return await this.registerUseCase.execute({
        name: body.name,
        email: body.email,
        password: body.password,
      });
    } catch (error) {
      throw mapDomainErrorToHttp(error as Error);
    }
  }

  @ApiOperation({
    summary: 'Login with local strategy',
    description: 'Login with local strategy',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Basic information about the logged user',
    type: UserResponseDto,
  })
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @UserAgent() userAgent: UserAgentParsed,
    @IpAddress() ipAddress: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    try {
      const { user, tokens } = await this.loginUseCase.execute(
        { email: body.email, password: body.password },
        { userAgent, ipAddress },
      );

      setCookie(res, 'refreshToken', tokens.refreshToken);
      return { user, accessToken: tokens.accessToken };
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
    type: UserResponseDto,
  })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: Request,
    @UserAgent() userAgent: UserAgentParsed,
    @IpAddress() ipAddress: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    try {
      const { user, tokens } = await this.loginWithOAuthUseCase.execute(
        req.user as OAuthProfile,
        AuthProvider.GOOGLE,
        { userAgent, ipAddress },
      );
      setCookie(res, 'refreshToken', tokens.refreshToken);
      return { user, accessToken: tokens.accessToken };
    } catch (error) {
      throw mapDomainErrorToHttp(error as Error);
    }
  }

  @ApiOperation({
    summary: 'Refresh session',
    description: 'Refresh the session using access/refresh tokens, user agent and ip address',
  })
  @ApiResponse({
    description: 'Access and refresh tokens were refreshed successfully',
    status: 200,
    type: TokenDto,
  })
  @Post('refresh')
  async refreshTokens(
    @RefreshToken() refreshToken: string,
    @AccessToken() accessToken: string,
    @UserAgent() userAgent: UserAgentParsed,
    @IpAddress() ipAddress: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenDto> {
    try {
      const tokens = await this.refreshSessionUseCase.execute(
        { userAgent, ipAddress },
        { accessToken, refreshToken },
      );

      setCookie(res, 'refreshToken', tokens.refreshToken);

      return { accessToken: tokens.accessToken };
    } catch (error) {
      throw mapDomainErrorToHttp(error as Error);
    }
  }
}
