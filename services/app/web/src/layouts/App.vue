<template>
  <header>
    <RouterLink to="/" class="brand">flisk-stack</RouterLink>
    <nav>
      <RouterLink to="/">Posts</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>
  </header>
  <main>
    <RouterView />
  </main>
</template>
