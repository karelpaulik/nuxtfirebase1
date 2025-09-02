<template>
  <div class="fixed full-width z-top">
    <q-toolbar class="bg-primary text-white shadow-2">
        <q-tabs align="center" no-caps>
          <q-route-tab to="/" label="Home" />
          <q-route-tab to="/load_direct/" label="Load direct" />
          <q-route-tab to="/storage_q-uploader/" label="q-uploader" />
          <q-route-tab to="/storage_q-file/" label="q-file" />
          <q-route-tab to="/users/" label="Users" />
          <q-route-tab to="/books/" label="Books" />
        </q-tabs>
    </q-toolbar>
  </div>

  <div>
    <main>
      <NuxtPage />
    </main>
  </div>

  <q-toolbar class="fixed-bottom bg-primary text-white shadow-2">
    <q-btn flat round dense icon="menu" />
    <q-toolbar-title>
      Spodní Toolbar
    </q-toolbar-title>
    <q-btn flat round dense icon="search" class="q-mr-xs" />
    <q-btn flat round dense icon="more_vert" />
  </q-toolbar>

</template>

<style scoped>
/* Rezervace místa pod hlavičkou */
main {
  padding-top: 50px; /* výška headeru + mezera */
  padding-bottom: 50px;
}
</style>

<style>
/* Aplikujeme overflow-x: auto a flex-wrap: nowrap přímo na q-toolbar */
.q-toolbar {
  overflow-x: auto;
  flex-wrap: nowrap; /* Důležité, aby se obsah nezalamoval */
  /* Styly pro skrytí scrollbaru */
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.q-toolbar::-webkit-scrollbar {
  display: none;
}
</style>