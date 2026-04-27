import { MediaType } from '../../src/modules/social/profile/domain/enums/post.enum';
import {
  MediaPosts,
  Post,
  PostData,
} from '../../src/modules/social/profile/domain/types/posts';

export const buildPostEntity = (overrides?: Partial<Post>): Post => {
  return {
    id: '030a9b1b-21db-415f-a172-415a77b99d8d',
    profileId: '030a9b1b-21db-415f-a172-415a77b99d8d',
    content: 'valid content',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
};

export const buildMediaPostsEntity = (overrides?: Partial<MediaPosts>): MediaPosts => {
  return {
    id: '030a9b1b-21db-415f-a172-415a77b99d8d',
    postId: '030a9b1b-21db-415f-a172-415a77b99d8d',
    url: '/valid/url',
    type: MediaType.IMAGE,
    createdAt: new Date(),
    ...overrides,
  };
};

export const POST: PostData = {
  post: buildPostEntity(),
  media: [buildMediaPostsEntity(), buildMediaPostsEntity()],
};
