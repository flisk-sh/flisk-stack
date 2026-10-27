<template>
  <h1>About</h1>
  <p>Every folder here follows a convention, so adding a feature means adding a file:</p>
  <ul>
    <li><code>api/src/Actions</code>: one file per endpoint</li>
    <li><code>api/src/Models</code>: one file per table</li>
    <li><code>worker/src/Jobs</code>: one file per background job</li>
    <li><code>migrations/prisma/migrations</code>: one folder per schema change</li>
    <li><code>web/src/views</code>: one file per page (this one is <code>About.vue</code>)</li>
  </ul>
  <p>Generate any of them with <code>bun stack make:&lt;thing&gt; Name</code>.</p>
</template>
