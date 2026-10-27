<script setup lang="ts">
import type { Post } from '../api';

defineProps<{ post: Post }>();
defineEmits<{ delete: [id: number] }>();
</script>

<template>
  <article class="card">
    <RouterLink :to="`/posts/${post.id}`"><h2>{{ post.title }}</h2></RouterLink>
    <p class="muted">{{ new Date(post.created_at).toLocaleString() }}</p>
    <p>{{ post.body }}</p>
    <button class="link" type="button" @click="$emit('delete', post.id)">Delete</button>
  </article>
</template>
