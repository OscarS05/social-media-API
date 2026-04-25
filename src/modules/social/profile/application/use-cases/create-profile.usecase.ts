import { Injectable } from '@nestjs/common';
import { CreateProfilData, ImageData, ProfileBasic } from '../../domain/types/profile';
import { ProfileRepository } from '../../domain/repositories/profile.repository';
import { ProfileEntity } from '../../domain/entities/profile.entity';
import { UniqueViolationError } from '../../domain/errors/profile.errors';
import { ImageManagerService } from '../../domain/services/image-manager.service';

@Injectable()
export class CreateProfileUseCase {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly imageManager: ImageManagerService,
  ) {}

  async execute(
    data: CreateProfilData,
    avatarData?: ImageData,
    coverData?: ImageData,
  ): Promise<ProfileBasic> {
    const existing = await this.profileRepo.findByUserId(data.userId);
    if (existing) throw new UniqueViolationError('The user already have a profile');

    const usernameInUse = await this.profileRepo.findByUserName(data.username);
    if (usernameInUse) throw new UniqueViolationError('The username is already in use');

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

    let avatarPath: string | null = null;
    let coverPath: string | null = null;

    try {
      [avatarPath, coverPath] = await this.imageManager.saveImages([
        avatarData ?? null,
        coverData ?? null,
      ]);

      if (avatarPath || coverPath) {
        newProfile.updateProfile({
          avatarUrl: avatarPath ?? null,
          coverPhotoUrl: coverPath ?? null,
        });

        return (await this.profileRepo.update(newProfile.userId, newProfile)).toBasic();
      }

      return newProfile.toBasic();
    } catch (error) {
      await this.imageManager.deleteImages([avatarPath, coverPath]);
      await this.profileRepo.delete(newProfile.userId);
      throw error;
    }
  }
}
