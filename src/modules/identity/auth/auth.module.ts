import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { Auth } from './infrastructure/persistence/db/entites/auth.orm-entity';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { LocalStrategy } from './infrastructure/services/strategies/local.strategy';
import { LoginUseCase } from './application/use-cases/Login.usecase';
import { RegisterUserUseCase } from './application/use-cases/Register-user.usecase';
import { AuthRepository } from './infrastructure/persistence/db/auth.repository';
import { BcryptPasswordHasher } from './infrastructure/services/security/bcrypt-hasher.service';
import { CreateUserUseCase } from '../users/application/use-cases/create-user.usecase';
import { UuidAdapter } from './infrastructure/services/security/uuid.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Auth]), PassportModule, UsersModule],
  controllers: [AuthController],
  providers: [
    { provide: 'IAuthRepository', useClass: AuthRepository },
    { provide: 'IHasherService', useClass: BcryptPasswordHasher },
    { provide: 'CreateUserPort', useClass: CreateUserUseCase },
    { provide: 'IUuidService', useClass: UuidAdapter },
    LoginUseCase,
    RegisterUserUseCase,
    LocalStrategy,
  ],
})
export class AuthModule {}
