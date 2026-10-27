import { defineAction } from '../../framework/action';
import { HttpError } from '../../framework/errors';
import { Post } from '../../Models/Post';

export default defineAction({
  name: 'DeletePost',
  method: 'DELETE',
  path: '/posts/:id',
  status: 204,
  async handle({ params }) {
    if (!(await Post.delete(Number(params.id)))) throw new HttpError(404, 'post not found');
  },
});
