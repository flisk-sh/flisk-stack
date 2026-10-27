// App-wide settings. Every value can be overridden from the environment (.env at the project root).
export const config = {
  name: process.env.APP_NAME ?? 'flisk-stack',
  // Where `src/framework/loader.ts` looks for Actions.
  actionsDir: new URL('../Actions', import.meta.url).pathname,
};
