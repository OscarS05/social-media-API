import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../dtos/user.dto';
import { CreateUserUseCase } from '../../application/use-cases/create-user.usecase';
import { UserEntity } from '../../domain/entities/user.entity';
import { mapDomainErrorToHttp } from '../mappers/error.mapper';

@Controller('users')
export class UsersController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  @Post()
  async createUser(@Body() body: CreateUserDto): Promise<{ user: UserEntity }> {
    try {
      return {
        user: await this.createUserUseCase.execute(body.name),
      };
    } catch (error) {
      throw mapDomainErrorToHttp(error as Error);
    }
  }
}
