import { defineJob } from '../framework/job';

// Queued by services/app/api/src/Actions/Posts/CreatePost.ts. Swap the log for an email, webhook or Slack call.
export default defineJob<{ postId: number; title: string }>({
  backoffSeconds: 5,
  handle({ postId, title }) {
    console.log(`[NotifyNewPost] new post #${postId}: ${title}`);
  },
});
