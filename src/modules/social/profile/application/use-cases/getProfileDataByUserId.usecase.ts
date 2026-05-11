import { Injectable } from '@nestjs/common';
import { ProfileRepository } from '../../domain/repositories/profile.repository';
import {
  DomainNotFoundError,
  ProfileAccessDeniedError,
} from '../../domain/errors/profile.errors';
import { ProfileAccessContext, ProfileView } from '../../domain/types/profile';
import { PostPreview } from '../../domain/types/posts';
import { PostRepository } from '../../domain/repositories/post.respository';

@Injectable()
export class GetProfileDataByUserIdUseCase {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly postRepo: PostRepository,
  ) {}

  public async execute(viewerId: string, ownerId: string): Promise<ProfileView> {
    const profileAccessContext = await this.profileRepo.getProfileAccessContext(
      viewerId,
      ownerId,
    );
    if (!profileAccessContext?.exists) throw new DomainNotFoundError();
    if (profileAccessContext.isBlocked) throw new ProfileAccessDeniedError();

    const profileData = await this.profileRepo.getProfileBaseView(ownerId);
    if (!profileData) throw new DomainNotFoundError();

    let postsPreview: PostPreview[] = [];
    if (this.canViewPosts(profileAccessContext)) {
      postsPreview = await this.postRepo.getPostsPreview(ownerId, { limit: 15 });
    }

    return {
      profile: profileData.profile,
      relations: profileData.relations,
      posts: postsPreview,
    };
  }

  private canViewPosts(context: ProfileAccessContext): boolean {
    if (!context.isPrivate) return true;

    return context.isFollower && context.isFollowing;
  }
}
