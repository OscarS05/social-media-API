import { Injectable } from '@nestjs/common';

@Injectable()
export class RegisterUserUseCase {
  constructor() {}

  execute(username: string, email: string, password: string) {
    return { username, email, password };
  }
}
