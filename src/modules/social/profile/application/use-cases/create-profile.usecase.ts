import { Injectable } from '@nestjs/common';
import { ImageData, ProfileBasic } from '../../domain/types/profile';
import { ProfileRepository } from '../../domain/repositories/profile.repository';
import { ProfileEntity } from '../../domain/entities/profile.entity';
import { InvalidProfileError } from '../../domain/errors/profile.errors';
import { ImageStoragePort } from '../../domain/services/image.service';

@Injectable()
export class CreateProfileUseCase {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly imageService: ImageStoragePort,
  ) {}

  async execute(
    data: ProfileBasic,
    avatarData?: ImageData,
    coverData?: ImageData,
  ): Promise<ProfileBasic> {
    const existing = await this.profileRepo.findByUserId(data.userId);
    if (existing) throw new InvalidProfileError('The user already have a profile');

    const usernameInUse = await this.profileRepo.findByUserName(data.username);
    if (usernameInUse) throw new InvalidProfileError('The username is already in use');

    const newProfile: ProfileEntity = await this.profileRepo.create(
      ProfileEntity.create({
        userId: data.userId,
        username: data.username,
        typePrivacy: data.typePrivacy,
        bio: data.bio,
        avatarUrl: null,
        coverPhotoUrl: null,
      }),
    );

    try {
      const [avatarPath, coverPath] = await Promise.all([
        avatarData?.buffer
          ? this.imageService.save(avatarData.buffer, avatarData.filename)
          : null,
        coverData?.buffer
          ? this.imageService.save(coverData.buffer, coverData.filename)
          : null,
      ]);

      if (avatarPath || coverPath) {
        newProfile.updateProfile({
          avatarUrl: avatarPath?.get() ?? null,
          coverPhotoUrl: coverPath?.get() ?? null,
        });

        return (
          await this.profileRepo.update(newProfile.userId, {
            avatarUrl: newProfile.avatarUrl,
            coverPhotoUrl: newProfile.coverPhotoUrl,
            updatedAt: newProfile.updatedAt,
          })
        ).toBasic();
      }

      return newProfile.toBasic();
    } catch (error) {
      await this.profileRepo.delete(newProfile.userId);
      throw error;
    }
  }
}
