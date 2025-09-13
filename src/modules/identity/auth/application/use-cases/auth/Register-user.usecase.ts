import { Inject, Injectable } from '@nestjs/common';

import type { IAuthRepository } from '../../../domain/repositories/auth.repository';
import type { createUserPort } from '../../../domain/ports/createUser.port';
import type { IUuidService } from '../../../domain/services/uuid.service';
import type { IHasherService } from '../../../domain/services/password-hasher.service';
import { AuthEntity } from '../../../domain/entities/auth.entity';
import { UserEntity } from '../../../domain/entities/user.entity';
import { AuthProvider } from '../../../domain/enums/providers.enum';
import { PasswordVO } from '../../../domain/value-objects/password.vo';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('IAuthRepository') private readonly authRepository: IAuthRepository,
    @Inject('CreateUserPort') private readonly createUserUseCase: createUserPort,
    @Inject('IUuidService') private readonly uuidService: IUuidService,
    @Inject('IHasherService') private readonly passwordHasher: IHasherService,
  ) {}

  async execute(
    name: string,
    email: string,
    password: string,
  ): Promise<{ user: UserEntity }> {
    await this.emailExists(email);
    const user: UserEntity = await this.createUserUseCase.execute(name);

    const authEntity: AuthEntity = await this.prepareDataToCreateAuth(
      user.id,
      email,
      password,
    );
    const newAuth = await this.authRepository.createAuth(authEntity);

    return { user: { ...user, email: newAuth.getEmail as string } };
  }

  private async emailExists(email: string): Promise<void | true> {
    const authRegister: AuthEntity | null = await this.authRepository.findByEmail(email);
    if (!authRegister) return true;

    authRegister?.existsEmailToRegister();
  }

  private async prepareDataToCreateAuth(
    userId: string,
    email: string,
    password: string,
  ): Promise<AuthEntity> {
    const authId: string = this.uuidService.generateId();
    const plainPassValidated = new PasswordVO(password).isValidPlainPass();
    const roundsToHash = Number(process.env.ROUNDS_HASH_PASSWORD) || 10;
    const passwordHashed: string = await this.passwordHasher.hash(
      plainPassValidated,
      roundsToHash,
    );
    const now = new Date();

    return new AuthEntity(
      authId,
      userId,
      AuthProvider.LOCAL,
      false,
      now,
      now,
      email,
      passwordHashed,
    );
  }
}
