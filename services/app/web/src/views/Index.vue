<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ApiError, api, type Post } from '../api';
import PostCard from '../components/PostCard.vue';

const posts = ref<Post[]>([]);
const form = ref({ title: '', body: '' });
const errors = ref<Record<string, string[]>>({});
const loadError = ref('');

async function load() {
  try {
    posts.value = await api.posts();
    loadError.value = '';
  } catch (err) {
    loadError.value = String(err);
  }
}

async function submit() {
  try {
    await api.createPost(form.value);
    form.value = { title: '', body: '' };
    errors.value = {};
    await load();
  } catch (err) {
    errors.value = err instanceof ApiError ? err.errors : { title: [String(err)] };
  }
}

async function remove(id: number) {
  await api.deletePost(id);
  await load();
}

onMounted(load);
</script>

<template>
  <h1>Posts</h1>

  <form class="card" @submit.prevent="submit">
    <label>Title <input v-model="form.title" placeholder="At least 3 characters" /></label>
    <p v-for="e in errors.title" :key="e" class="error">{{ e }}</p>
    <label>Body <textarea v-model="form.body" rows="3" /></label>
    <p v-for="e in errors.body" :key="e" class="error">{{ e }}</p>
    <button type="submit">Publish</button>
  </form>

  <p v-if="loadError" class="error">Could not reach the api: {{ loadError }}</p>
  <PostCard v-for="post in posts" :key="post.id" :post="post" @delete="remove" />
</template>
