import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './layouts/App.vue';
import { routesFrom } from './routes';
import './style.css';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routesFrom(import.meta.glob('./views/**/*.vue')),
});

createApp(App).use(router).mount('#app');
