import {
  ConflictException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import {
  AccountNotVerifiedError,
  EmailAlreadyInUseError,
  InvalidProviderError,
  InvalidEmailError,
  InvalidIdError,
  InvalidPasswordError,
  UnauthorizedError,
  InvalidCredentialsError,
  InvalidTokenError,
} from '../../domain/errors/auth.errors';
import { InvalidNameError, InvalidRoleError } from '../../domain/errors/user.errors';
import { SessionNotFoundError } from '../../domain/errors/session.errors';

export function mapDomainErrorToHttp(err: Error): HttpException {
  if (err instanceof AccountNotVerifiedError) return new ForbiddenException(err.message);
  if (err instanceof InvalidProviderError) return new BadRequestException(err.message);
  if (err instanceof EmailAlreadyInUseError) return new ConflictException(err.message);
  if (err instanceof InvalidEmailError) return new BadRequestException(err.message);
  if (err instanceof InvalidIdError) return new InternalServerErrorException(err.message);
  if (err instanceof InvalidPasswordError) return new BadRequestException(err.message);
  if (err instanceof InvalidNameError) return new BadRequestException(err.message);
  if (err instanceof InvalidRoleError) return new UnauthorizedException(err.message);
  if (err instanceof UnauthorizedError) return new UnauthorizedException(err.message);
  if (err instanceof SessionNotFoundError) return new NotFoundException(err.message);
  if (err instanceof InvalidCredentialsError) return new UnauthorizedException(err.message);
  if (err instanceof InvalidTokenError) return new UnauthorizedException(err.message);

  return new InternalServerErrorException(err.message);
}
