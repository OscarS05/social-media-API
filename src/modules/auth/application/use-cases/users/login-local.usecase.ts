import { Injectable } from '@nestjs/common';

import { UserRepository } from '../../../domain/repositories/user.repository';
import { HasherService } from '../../../domain/services/hasher.service';
import { UserEntity } from '../../../domain/entities/user.entity';
import { InvalidCredentialsError } from '../../../domain/errors/auth.errors';
import { UserCredentials } from '../../../domain/types/user';
import { SessionManagerService } from '../../services/session-manager.service';
import { LoginData, SessionContext } from '../../../domain/types/session';

@Injectable()
export class LoginUseCase {
  constructor(
    private userRepository: UserRepository,
    private sessionManager: SessionManagerService,
    private passwordHasher: HasherService,
  ) {}

  public async execute(data: UserCredentials, context: SessionContext): Promise<LoginData> {
    const user: UserEntity = await this.findUserOrFail(data.email);

    user.validateLocalAuth();
    user.ensureVerified();
    await this.validPassword(data.password, user.password!);

    return {
      user: user.toBasic(),
      tokens: await this.sessionManager.createSession(context, user.id, user.role),
    };
  }

  private async findUserOrFail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new InvalidCredentialsError('Email or password is incorrect');
    return user;
  }

  private async validPassword(plainPassword: string, passwordHashed: string): Promise<void> {
    const isValid: boolean = await this.passwordHasher.compare(plainPassword, passwordHashed);
    if (!isValid) throw new InvalidCredentialsError('Email or password is incorrect');
  }
}
