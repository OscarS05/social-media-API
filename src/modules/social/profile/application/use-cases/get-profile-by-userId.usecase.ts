import { Injectable } from '@nestjs/common';
import { ProfileRepository } from '../../domain/repositories/profile.repository';
import {
  DomainNotFoundError,
  ProfileAccessDeniedError,
} from '../../domain/errors/profile.errors';
import { ProfileAccessContext } from '../../domain/types/profile';

@Injectable()
export class GetProfileByUserId {
  constructor(private readonly profileRepo: ProfileRepository) {}

  public async execute(viewerId: string, ownerId: string) {
    const profileAccessContext = await this.profileRepo.getProfileAccessContext(
      viewerId,
      ownerId,
    );
    if (!profileAccessContext?.exists) throw new DomainNotFoundError();
    if (profileAccessContext.isBlocked) throw new ProfileAccessDeniedError();

    return this.profileRepo.getProfileViewByUserId(ownerId, {
      includePosts: this.showLimitedProfile(profileAccessContext),
    });
  }

  private showLimitedProfile(context: ProfileAccessContext): boolean {
    if (!context.isPrivate) return true;

    return context.isFollower && context.isFollowing;
  }
}
