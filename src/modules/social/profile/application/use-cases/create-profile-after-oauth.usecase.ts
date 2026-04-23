import { Injectable } from '@nestjs/common';
import { OAuthProfile, ProfileBasic } from '../../domain/types/profile';
import { ProfileRepository } from '../../domain/repositories/profile.repository';
import { ProfileEntity } from '../../domain/entities/profile.entity';
import { InvalidProfileError, UniqueViolationError } from '../../domain/errors/profile.errors';
import { Privacy } from '../../domain/enums/privacy.enum';
import { UsernameGeneratorService } from '../services/username-generator.service';

@Injectable()
export class CreateProfileWithOAuthUseCase {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly usernameGeneratorService: UsernameGeneratorService,
  ) {}

  async execute(data: OAuthProfile): Promise<ProfileBasic> {
    const existing = await this.profileRepo.findByUserId(data.userId);
    if (existing) throw new InvalidProfileError('The user already have a profile');

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const base = this.usernameGeneratorService.normalizeName(data.name);
        const usernames = await this.profileRepo.findUsernames(base);
        const username = this.usernameGeneratorService.generate(data.name, usernames);
        const profile = await this.profileRepo.create(
          ProfileEntity.create({
            userId: data.userId,
            username,
            typePrivacy: Privacy.PUBLIC,
            bio: null,
            avatarUrl: data.avatarUrl ?? null,
            coverPhotoUrl: null,
          }),
        );
        return profile.toBasic();
      } catch (error) {
        if (!(error instanceof UniqueViolationError)) throw error;
      }
    }

    throw new InvalidProfileError('Failed to create unique username');
  }
}
