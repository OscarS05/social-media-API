import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../dtos/user.dto';
import { CreateUserUseCase } from '../../application/use-cases/create-user.usecase';

@Controller('users')
export class UsersController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  @Post()
  createUser(@Body() body: CreateUserDto) {
    return this.createUserUseCase.execute(body.name);
  }
}
