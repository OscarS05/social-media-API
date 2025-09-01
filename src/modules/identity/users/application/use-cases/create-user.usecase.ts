import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

import type { IUserRepository } from '../../domain/repositories/user.repository';
import type { UuidService } from '../../domain/services/uuid.service';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserIdVO } from '../../domain/value-objects/userId.vo';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository') private usersRepository: IUserRepository,
    @Inject('UuidService') private uuidService: UuidService,
  ) {}

  async execute(name: string) {
    const newUser: UserEntity = this.createEntity(name);
    const user: UserEntity | null = await this.usersRepository.createUser(newUser);
    if (!user) {
      throw new InternalServerErrorException('Something went wrong');
    }

    return user;
  }

  createEntity(name: string): UserEntity {
    const userId = new UserIdVO(this.uuidService).generateId();
    const now: Date = new Date();
    return new UserEntity(userId, name, now, now);
  }
}
