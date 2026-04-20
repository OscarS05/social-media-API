import { Injectable } from '@nestjs/common';

import { UserRepository } from '../../../domain/repositories/user.repository';
import { HasherService } from '../../../domain/services/hasher.service';
import { UserEntity } from '../../../domain/entities/user.entity';
import { AuthProvider } from '../../../domain/enums/providers.enum';
import { EmailAlreadyInUseError } from '../../../domain/errors/auth.errors';
import { UserBasic, UserLocal } from '../../../domain/types/user';
import { UuidService } from '../../../domain/services/uuid.service';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly uuidService: UuidService,
    private readonly passwordHasher: HasherService,
  ) {}

  async execute(userData: UserLocal): Promise<UserBasic> {
    await this.findUserOrFail(userData.email);

    const user: UserEntity = await this.prepareData(userData);
    const newUser: UserEntity = await this.userRepository.createUser(user);

    return newUser.toBasic();
  }

  private async findUserOrFail(email: string): Promise<void> {
    const user: UserEntity | null = await this.userRepository.findByEmail(email);
    if (user) throw new EmailAlreadyInUseError();
  }

  private async prepareData(userData: UserLocal): Promise<UserEntity> {
    const user = UserEntity.create({
      id: this.uuidService.generate(),
      name: userData.name,
      email: userData.email,
      provider: AuthProvider.LOCAL,
      password: userData.password,
      isVerified: false,
    });

    const passwordHashed: string = await this.passwordHasher.hash(userData.password);

    user.changePassword(passwordHashed);
    return user;
  }
}
