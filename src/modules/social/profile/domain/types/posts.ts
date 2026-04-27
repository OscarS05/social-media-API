import { MediaType } from '../enums/post.enum';

export type Post = {
  id: string;
  profileId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type MediaPosts = {
  id: string;
  postId: string;
  url: string;
  type: MediaType;
  createdAt: Date;
};

export type PostData = {
  post: Post;
  media: MediaPosts[];
};
