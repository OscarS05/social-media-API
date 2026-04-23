import { Injectable } from '@nestjs/common';
import { ImageData, OAuthProfile, ProfileBasic } from '../domain/types/profile';
import { ProfileRepository } from '../domain/repositories/profile.repository';
import { ProfileEntity } from '../domain/entities/profile.entity';
import { InvalidProfileError } from '../domain/errors/profile.errors';
import { ImageStoragePort } from '../domain/services/image.service';
import { Privacy } from '../domain/enums/privacy.enum';

@Injectable()
export class CreateProfileUseCase {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly imageService: ImageStoragePort,
  ) {}

  async execute(data: OAuthProfile): Promise<ProfileBasic> {
    const existing = await this.profileRepo.findByUserId(data.userId);
    if (existing) throw new InvalidProfileError('The user already have a profile');

    const username: string = await this.buildUsername(data.name);

    const newProfile: ProfileEntity = await this.profileRepo.create(
      ProfileEntity.createAfterOAuth({
        userId: data.userId,
        username,
        typePrivacy: Privacy.PUBLIC,
        bio: null,
        avatarUrl: data.avatarUrl ?? null,
        coverPhotoUrl: null,
      }),
    );

    return newProfile.toBasic();
  }

  private async buildUsername(name: string): Promise<string> {
    let username: string | null = null;
    let existing: ProfileEntity | null = null;

    // Falla condicional
    while (existing) {
      const base = name.toLowerCase().replace(/\s+/g, '_');
      const suffix = Math.random().toString(36).slice(2, 7);
      username = `${base}_${suffix}`;

      existing = await this.profileRepo.findByUserName(username);
    }

    return username ?? '';
  }
}
