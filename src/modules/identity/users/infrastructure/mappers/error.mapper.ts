import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import {
  InvalidIdError,
  InvalidNameError,
  InvalidRoleError,
} from '../../domain/errors/errors';

export function mapDomainErrorToHttp(err: Error): any {
  if (err instanceof InvalidIdError) return new InternalServerErrorException(err.message);
  if (err instanceof InvalidNameError) return new BadRequestException(err.message);
  if (err instanceof InvalidRoleError)
    return new InternalServerErrorException(err.message);

  return err;
}
