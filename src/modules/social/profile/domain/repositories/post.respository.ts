import { Pagination, PostData } from '../types/posts';

export abstract class PostRepository {
  abstract getPostsWithMedia(postId: string, options?: Pagination): Promise<PostData[]>;
}
