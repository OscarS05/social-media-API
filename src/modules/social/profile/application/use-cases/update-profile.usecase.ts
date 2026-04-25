import { Injectable } from '@nestjs/common';
import { ProfileRepository } from '../../domain/repositories/profile.repository';
import { ImageData, ProfileBasic, UpdateProfileInput } from '../../domain/types/profile';
import { ProfileEntity } from '../../domain/entities/profile.entity';
import {
  DomainNotFoundError,
  UsernameAlreadyInUseError,
} from '../../domain/errors/profile.errors';
import { ImageManagerService } from '../../domain/services/image-manager.service';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly imageManager: ImageManagerService,
  ) {}

  public async execute(
    userId: string,
    data: UpdateProfileInput,
    avatarData?: ImageData,
    coverData?: ImageData,
  ): Promise<ProfileBasic> {
    const profile: ProfileEntity | null = await this.profileRepo.findByUserId(userId);
    if (!profile) throw new DomainNotFoundError();

    const oldAvatar = profile.avatarUrl;
    const oldCover = profile.coverPhotoUrl;

    profile.updateProfile(data);

    if (data?.username) {
      const usernameInUse = await this.profileRepo.findByUserName(data.username);
      if (usernameInUse) throw new UsernameAlreadyInUseError();
    }

    const [newAvatarUrl, newCoverUrl] = await this.imageManager.saveImages([
      avatarData ?? null,
      coverData ?? null,
    ]);

    let updatedProfile: ProfileEntity;
    try {
      profile.updateProfile({
        avatarUrl: newAvatarUrl ?? oldAvatar ?? null,
        coverPhotoUrl: newCoverUrl ?? oldCover ?? null,
      });
      updatedProfile = await this.profileRepo.update(userId, profile);
    } catch (error) {
      await this.imageManager.deleteImages([newAvatarUrl, newCoverUrl]);
      throw error;
    }

    await this.imageManager.deleteImages([
      newAvatarUrl ? oldAvatar : null,
      newCoverUrl ? oldCover : null,
    ]);

    return updatedProfile.toBasic();
  }
}
