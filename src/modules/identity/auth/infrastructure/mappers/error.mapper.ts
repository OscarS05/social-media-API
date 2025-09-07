import {
  ConflictException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  AccountNotVerifiedError,
  EmailAlreadyInUseError,
  InvalidProviderError,
  InvalidEmailError,
  InvalidIdError,
  InvalidPasswordError,
} from '../../domain/errors/errors';

export function mapDomainErrorToHttp(err: Error): any {
  if (err instanceof AccountNotVerifiedError) return new ForbiddenException(err.message);
  if (err instanceof InvalidProviderError) return new BadRequestException(err.message);
  if (err instanceof EmailAlreadyInUseError) return new ConflictException(err.message);
  if (err instanceof InvalidEmailError) return new BadRequestException(err.message);
  if (err instanceof InvalidIdError) return new InternalServerErrorException(err.message);
  if (err instanceof InvalidPasswordError) return new BadRequestException(err.message);

  return err;
}
