import { defineAction } from '../../framework/action';
import { dispatch } from '../../framework/queue';
import { Post } from '../../Models/Post';

export default defineAction<{ title: string; body?: string }>({
  name: 'CreatePost',
  method: 'POST',
  path: '/posts',
  status: 201,
  rules: {
    title: 'required|string|min:3|max:120',
    body: 'string|max:5000',
  },
  async handle({ input }) {
    const post = await Post.create(input);
    // Runs in the worker: services/app/worker/src/Jobs/NotifyNewPost.ts
    await dispatch('NotifyNewPost', { postId: post.id, title: post.title });
    return post;
  },
});
