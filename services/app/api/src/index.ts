import { createApp } from './app';
import { config } from './config/app';
import { loadActions } from './framework/loader';

const actions = await loadActions(config.actionsDir);
const app = createApp(actions);

const port = process.env.PORT || 4000;
console.log(`\n🚀 ${config.name} api running on http://localhost:${port}`);
for (const a of actions) console.log(`   ${a.method.padEnd(6)} ${a.path}  (${a.name})`);

export default {
  port,
  fetch: app.fetch,
};
