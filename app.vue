<template>
  <div>
    <header>
      <nav>
        <ul>
          <li><NuxtLink to="/">Home</NuxtLink></li>
          <li><NuxtLink to="/load_direct">Load direct</NuxtLink></li>
          <li><NuxtLink to="/users">All users</NuxtLink></li>
        </ul>
      </nav>
    </header>

    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<style scoped>
/* Pevná hlavička */
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #f0f0f0;
  padding: 1rem 2rem;
  border-bottom: 1px solid #ddd;
  z-index: 1000;
}

/* Rezervace místa pod hlavičkou */
main {
  padding-top: 40px; /* výška headeru + mezera */
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
