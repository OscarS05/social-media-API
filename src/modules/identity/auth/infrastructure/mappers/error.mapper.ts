import {
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  AccountNotVerifiedError,
  EmailAlreadyInUseError,
  InvalidProviderError,
} from '../../domain/errors/errors';

export function mapDomainErrorToHttp(err: Error): any {
  if (err instanceof AccountNotVerifiedError) return new ForbiddenException(err.message);
  if (err instanceof InvalidProviderError) return new BadRequestException(err.message);
  if (err instanceof EmailAlreadyInUseError) return new ConflictException(err.message);

  return err;
}
