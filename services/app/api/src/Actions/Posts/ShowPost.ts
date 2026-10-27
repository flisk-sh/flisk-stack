import { defineAction } from '../../framework/action';
import { HttpError } from '../../framework/errors';
import { Post } from '../../Models/Post';

export default defineAction({
  name: 'ShowPost',
  method: 'GET',
  path: '/posts/:id',
  async handle({ params }) {
    const post = await Post.find(Number(params.id));
    if (!post) throw new HttpError(404, 'post not found');
    return post;
  },
});
