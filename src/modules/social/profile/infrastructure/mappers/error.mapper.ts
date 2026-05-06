import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  DomainNotFoundError,
  InternalServerError,
  InvalidBioError,
  InvalidIdFoundError,
  InvalidPathError,
  InvalidProfileError,
  InvalidUrlError,
  InvalidUsernameError,
  ProfileAccessDeniedError,
  UniqueViolationError,
  UsernameAlreadyInUseError,
} from '../../domain/errors/profile.errors';
import { BadRequestError } from '../../../../../shared/services/pipes/imageValidation.pipe';

export function ProfileErrorMapper(error: Error): HttpException {
  if (
    error instanceof InvalidIdFoundError ||
    error instanceof InvalidUsernameError ||
    error instanceof InvalidUrlError ||
    error instanceof InvalidBioError ||
    error instanceof InvalidPathError ||
    error instanceof InvalidProfileError ||
    error instanceof BadRequestError
  ) {
    return new BadRequestException({
      message: error.message,
      error: error.name,
    });
  }

  if (error instanceof DomainNotFoundError) {
    return new NotFoundException({
      message: error.message,
      error: error.name,
    });
  }

  if (error instanceof ProfileAccessDeniedError) {
    return new ForbiddenException({
      message: error.message,
      error: error.name,
    });
  }

  if (error instanceof UsernameAlreadyInUseError || error instanceof UniqueViolationError) {
    return new ConflictException({
      message: error.message,
      error: error.name,
    });
  }

  if (error instanceof InternalServerError) {
    return new InternalServerErrorException({
      message: error.message,
      error: error.name,
    });
  }

  return new InternalServerErrorException({
    message: 'Unexpected internal server error',
    error: error.name,
  });
}
