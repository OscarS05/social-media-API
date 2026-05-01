import { PostRepository } from '../../../../../../src/modules/social/profile/domain/repositories/post.respository';

export class MockPostRepository extends PostRepository {
  getPostsWithMedia = jest.fn();
}
