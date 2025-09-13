import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserEntity } from '../../../domain/entities/user.entity';

@Injectable()
export class GenerateTokensUseCase {
  constructor(@Inject('JwtService') private readonly jwtService: JwtService) {}

  public execute(user: UserEntity): string {
    const payload = { sub: user.id, role: user.role };
    return this.jwtService.sign(payload, {
      secret: process.env.ACCESS_SECRET,
      expiresIn: process.env.ACCESS_EXPIRES_IN,
    });
  }
}
