import { defineAction } from '../../framework/action';
import { Post } from '../../Models/Post';

export default defineAction({
  name: 'ListPosts',
  method: 'GET',
  path: '/posts',
  handle: () => Post.all(),
});
