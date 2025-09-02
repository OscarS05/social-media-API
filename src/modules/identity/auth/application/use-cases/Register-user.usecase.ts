import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

import type { IAuthRepository } from '../../domain/repositories/auth.repository';
import type { createUserPort } from '../../domain/ports/createUser.port';
import type { IUuidService } from '../../domain/services/uuid.service';
import type { IHasherService } from '../../domain/services/password-hasher.service';
import { AuthEntity } from '../../domain/entities/auth.entity';
import { AuthIdVO } from '../../domain/entities/authId.value-object';
import { UserEntity } from '../../domain/entities/user.entity';
import { AuthProvider } from '../../domain/entities/providers.enum';

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
    const user: UserEntity = await this.createUser(name);

    const auth: AuthEntity = await this.createAuth(user.id, email, password);

    return { user: { ...user, email: auth.email as string } };
  }

  private async emailExists(email: string): Promise<void | true> {
    const authRegister: AuthEntity | null = await this.authRepository.findByEmail(email);
    if (!authRegister) return true;

    authRegister?.existsEmailToRegister();
  }

  private async createUser(name: string): Promise<UserEntity> {
    return this.createUserUseCase.execute(name);
  }

  private async createAuth(
    userId: string,
    email: string,
    password: string,
  ): Promise<AuthEntity> {
    const createAuthEntity: AuthEntity = await this.prepareDataToCreateAuth(
      userId,
      email,
      password,
    );

    const createdAuth: AuthEntity | null =
      await this.authRepository.createAuth(createAuthEntity);

    if (!createdAuth) {
      throw new InternalServerErrorException('Something went wrong');
    }

    return createdAuth;
  }

  private async prepareDataToCreateAuth(
    userId: string,
    email: string,
    password: string,
  ): Promise<AuthEntity> {
    const authId: string = new AuthIdVO(this.uuidService).generateId();
    const roundsToHash = Number(process.env.ROUNDS_HASH_PASSWORD) || 10;
    const passwordHashed: string = await this.passwordHasher.hash(password, roundsToHash);
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
