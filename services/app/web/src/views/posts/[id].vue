<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { api, type Post } from '../../api';

const route = useRoute();
const post = ref<Post | null>(null);
const error = ref('');

watchEffect(async () => {
  try {
    post.value = await api.post(route.params.id as string);
  } catch (err) {
    error.value = String(err);
  }
});
</script>

<template>
  <RouterLink to="/">← All posts</RouterLink>
  <p v-if="error" class="error">{{ error }}</p>
  <article v-else-if="post">
    <h1>{{ post.title }}</h1>
    <p class="muted">{{ new Date(post.created_at).toLocaleString() }}</p>
    <p>{{ post.body }}</p>
  </article>
</template>
