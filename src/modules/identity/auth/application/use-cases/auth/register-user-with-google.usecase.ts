import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

import type { IAuthRepository } from '../../../domain/repositories/auth.repository';
import type { IUuidService } from '../../../domain/services/uuid.service';
import type { createUserPort } from '../../../domain/ports/createUser.port';
import { UserEntity } from '../../../domain/entities/user.entity';
import { AuthEntity } from '../../../domain/entities/auth.entity';
import { AuthProvider } from '../../../domain/enums/providers.enum';
import { GoogleProvider } from '../../../domain/services/googleProvider.service';

@Injectable()
export class RegisterUserWithGoogleUseCase {
  constructor(
    @Inject('IAuthRepository') private readonly authRepository: IAuthRepository,
    @Inject('IUuidService') private readonly uuidService: IUuidService,
    @Inject('CreateUserPort') private readonly createUserUseCase: createUserPort,
  ) {}

  public async execute(googleProfile: GoogleProvider): Promise<{ user: UserEntity }> {
    const userExists = await this.userExists(googleProfile);
    if (userExists) return userExists;

    const newUser: UserEntity = await this.createUser(googleProfile);
    const newAuth: AuthEntity = await this.createAuth(googleProfile, newUser.id);
    return {
      user: { ...newUser, email: newAuth.getEmail ?? '' },
    };
  }

  private async userExists(
    googleProfile: GoogleProvider,
  ): Promise<{ user: UserEntity } | null> {
    const userAuth: AuthEntity | null = await this.authRepository.findByProviderId(
      AuthProvider.GOOGLE,
      googleProfile.providerId,
    );

    if (userAuth) {
      return {
        user: { ...(userAuth.user as UserEntity), email: userAuth.getEmail ?? '' },
      };
    }

    return null;
  }

  private async createUser(googleProfile: GoogleProvider): Promise<UserEntity> {
    return this.createUserUseCase.execute(googleProfile.name);
  }

  private async createAuth(
    googleProfile: GoogleProvider,
    userId: string,
  ): Promise<AuthEntity> {
    const authEntity: AuthEntity = this.prepareDataToCreateAuth(googleProfile, userId);
    const newAuth: AuthEntity | null = await this.authRepository.createAuth(authEntity);

    if (!newAuth) {
      throw new InternalServerErrorException('Something went wrong creating the user');
    }

    return newAuth;
  }

  private prepareDataToCreateAuth(
    googleProfile: GoogleProvider,
    userId: string,
  ): AuthEntity {
    const authId = this.uuidService.generateId();
    const now = new Date();
    return new AuthEntity(
      authId,
      userId,
      AuthProvider.GOOGLE,
      googleProfile.verified ?? true,
      now,
      now,
      googleProfile.email,
      null,
      googleProfile.providerId,
      null,
      null,
    );
  }
}
