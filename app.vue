<template>
  <header>
    <nav>
      <ul>
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li><NuxtLink to="/load_direct">Load direct</NuxtLink></li>
        <li><NuxtLink to="/user">User</NuxtLink></li>
        <li><NuxtLink to="/user/users">All users</NuxtLink></li>
      </ul>
    </nav>
  </header>

  <NuxtPage />
</template>

<style scoped>
header {
  background-color: #f0f0f0; /* světle šedá sekce */
  padding: 1rem 2rem;
  border-bottom: 1px solid #ddd;
}

nav ul {
  list-style: none;
  display: flex;
  gap: 1.5rem;
  padding: 0;
  margin: 0;
}

nav a {
  text-decoration: none;
  color: #333;
  transition: color 0.2s;
}

nav a:hover {
  color: #007bff;
}

.router-link-active {
  font-weight: bold;
  color: #007bff;
}
</style>
