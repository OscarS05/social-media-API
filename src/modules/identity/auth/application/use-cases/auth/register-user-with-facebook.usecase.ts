import { Inject, Injectable } from '@nestjs/common';

import type { IAuthRepository } from '../../../domain/repositories/auth.repository';
import type { createUserPort } from '../../../domain/ports/createUser.port';
import type { IUuidService } from '../../../domain/services/uuid.service';
import { FacebookProvider } from '../../../domain/services/facebookProvider.service';
import { UserEntity } from '../../../domain/entities/user.entity';
import { AuthEntity } from '../../../domain/entities/auth.entity';
import { AuthProvider } from '../../../domain/enums/providers.enum';

@Injectable()
export class RegisterUserWithFacebookUseCase {
  constructor(
    @Inject('IAuthRepository') private readonly authRepository: IAuthRepository,
    @Inject('CreateUserPort') private readonly createUserPort: createUserPort,
    @Inject('IUuidService') private readonly uuidService: IUuidService,
  ) {}

  async execute(facebookProfile: FacebookProvider): Promise<{ user: UserEntity }> {
    const userExists = await this.userExists(facebookProfile);
    if (userExists) return userExists;

    const newUser: UserEntity = await this.createUserPort.execute(facebookProfile.name);
    const authEntity: AuthEntity = this.prepareDataToCreateAuth(
      facebookProfile,
      newUser.id,
    );
    const newAuth: AuthEntity | null = await this.authRepository.createAuth(authEntity);

    return {
      user: { ...newUser, email: newAuth.getEmail ?? '' },
    };
  }

  private async userExists(
    facebookProfile: FacebookProvider,
  ): Promise<{ user: UserEntity } | null> {
    const userAuth: AuthEntity | null = await this.authRepository.findByProviderId(
      AuthProvider.FACEBOOK,
      facebookProfile.providerId,
    );
    if (!userAuth) return null;

    return {
      user: { ...(userAuth.user as UserEntity), email: userAuth.getEmail ?? '' },
    };
  }

  private prepareDataToCreateAuth(
    facebookProfile: FacebookProvider,
    userId: string,
  ): AuthEntity {
    const now = new Date();
    const authId = this.uuidService.generateId();
    return new AuthEntity(
      authId,
      userId,
      AuthProvider.FACEBOOK,
      facebookProfile?.verified ?? true,
      now,
      now,
      facebookProfile.email,
      null,
      facebookProfile.providerId,
      null,
      null,
    );
  }
}
