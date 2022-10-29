<template>
    <app-header />
        <router-view />
    <app-footer />
</template>

<script>

import AppHeader from "./components/layouts/AppHeader.vue"
import AppFooter from "./components/layouts/AppFooter.vue"

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter
  }
}
</script>
