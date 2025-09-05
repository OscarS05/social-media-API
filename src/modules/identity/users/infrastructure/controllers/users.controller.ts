import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../dtos/user.dto';
import { CreateUserUseCase } from '../../application/use-cases/create-user.usecase';
import { UserEntity } from '../../domain/entities/user.entity';
import { mapDomainErrorToHttp } from '../mappers/error.mapper';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from '../persistence/db/entities/user.orm-entity';

@Controller('users')
export class UsersController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  @ApiOperation({
    summary: 'Create a user',
    description: 'Create a user but without an authentication',
  })
  @ApiResponse({ status: 201, description: 'Saved user information', type: User })
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
