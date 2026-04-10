import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserEntity } from '../../../domain/entities/user.entity';
import type { IJwtService } from '../../../domain/services/jwt.service';

@Injectable()
export class GenerateTokensUseCase {
  constructor(
    @Inject('JwtService') private readonly jwtService: IJwtService,
    private readonly configService: ConfigService,
  ) {}

  public execute(user: UserEntity): string {
    const payload = { sub: user.id, role: user.role };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESS_SECRET'),
      expiresIn: this.configService.get('ACCESS_EXPIRES_IN'),
    });
  }
}
