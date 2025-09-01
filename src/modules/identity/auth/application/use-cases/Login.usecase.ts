import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import type { IAuthRepository } from '../../domain/repositories/auth.repository';
import type { IHasherService } from '../../domain/services/password-hasher.service';
import { AuthEntity } from '../../domain/entities/auth.entity';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IAuthRepository') private authRepository: IAuthRepository,
    @Inject('IHasherService') private passwordHasher: IHasherService,
  ) {}

  async execute(email: string, password: string) {
    const authEntity: AuthEntity = await this.validEmail(email);

    authEntity.ensureValidProvider();

    await this.validPassword(password, authEntity.password ?? '');

    authEntity.ensureVerified();

    return { user: { ...authEntity.user, email: authEntity.email } };
  }

  async validEmail(email: string): Promise<AuthEntity> {
    const result: AuthEntity | null = await this.authRepository.findByEmail(email);

    if (result === null) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return result;
  }

  async validPassword(plainPassword: string, passwordHashed: string): Promise<boolean> {
    const isValid: boolean = await this.passwordHasher.compare(
      plainPassword,
      passwordHashed,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return true;
  }
}
