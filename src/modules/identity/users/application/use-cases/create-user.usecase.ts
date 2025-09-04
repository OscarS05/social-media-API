import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

import type { IUserRepository } from '../../domain/repositories/user.repository';
import type { IUuidService } from '../../domain/services/uuid.service';
import { UserEntity } from '../../domain/entities/user.entity';
import { Roles } from '../../domain/entities/roles.enum';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository') private usersRepository: IUserRepository,
    @Inject('IUuidService') private uuidService: IUuidService,
  ) {}

  async execute(name: string) {
    const newUser: UserEntity = this.createEntity(name);
    const user: UserEntity | null = await this.usersRepository.createUser(newUser);
    if (!user) {
      throw new InternalServerErrorException('Something went wrong');
    }

    return user;
  }

  private createEntity(name: string): UserEntity {
    const userId = this.uuidService.generateId();
    const now: Date = new Date();
    return new UserEntity(userId, name, Roles.MEMBER, now, now);
  }
}
