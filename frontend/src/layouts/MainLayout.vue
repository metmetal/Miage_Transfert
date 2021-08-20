<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          Single Quote Transfert
        </q-toolbar-title>

        <q-toolbar-title>
          <q-btn class="q-ml-xl">Inscription</q-btn>
          <q-btn class="q-ml-xl">Connexion</q-btn>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout'
}
</script>
