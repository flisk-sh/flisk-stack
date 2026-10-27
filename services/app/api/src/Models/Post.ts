import { defineModel } from '../framework/model';

export interface Post {
  id: number;
  title: string;
  body: string;
  created_at: Date;
}

// Table created by services/app/migrations/prisma/migrations/*_create_posts.
export const Post = defineModel<Post>({
  table: 'posts',
  fillable: ['title', 'body'],
});
