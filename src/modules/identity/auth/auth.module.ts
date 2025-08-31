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

@Module({
  imports: [TypeOrmModule.forFeature([Auth]), PassportModule],
  controllers: [AuthController],
  providers: [
    { provide: 'IAuthRepository', useClass: AuthRepository },
    { provide: 'PasswordHasher', useClass: BcryptPasswordHasher },
    LoginUseCase,
    RegisterUserUseCase,
    LocalStrategy,
  ],
})
export class AuthModule {}
