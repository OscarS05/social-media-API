import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './infrastructure/controllers/users.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { User } from './infrastructure/persistence/db/entities/user.orm-entity';
import { UserRepository } from './infrastructure/persistence/db/user.repository';
import { NodeUuidService } from './infrastructure/services/uuid.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    { provide: 'IUserRepository', useClass: UserRepository },
    { provide: 'IUuidService', useClass: NodeUuidService },
    CreateUserUseCase,
  ],
  exports: ['IUserRepository'],
})
export class UsersModule {}
