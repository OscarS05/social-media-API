import { Pagination, PostData, PostPreview } from '../types/posts';

export abstract class PostRepository {
  abstract getPostsPreview(postId: string, options?: Pagination): Promise<PostPreview[]>;
  abstract getPostsWithMedia(postId: string, options?: Pagination): Promise<PostData[]>;
}
