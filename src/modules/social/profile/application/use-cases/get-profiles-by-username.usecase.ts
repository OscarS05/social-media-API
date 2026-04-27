import { Injectable } from '@nestjs/common';
import { ProfileRepository } from '../../domain/repositories/profile.repository';
import { ProfilePreview } from '../../domain/types/profile';
import { UsernameVO } from '../../domain/value-objects/username.vo';

@Injectable()
export class GetProfilesByUsernameUseCase {
  constructor(private readonly profileRepo: ProfileRepository) {}

  public async execute(username: string): Promise<ProfilePreview[]> {
    return this.profileRepo.findAllProfilesByUsername(UsernameVO.create(username ?? '').get());
  }
}
