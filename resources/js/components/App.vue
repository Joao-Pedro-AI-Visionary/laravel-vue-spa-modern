<template>
  <a class="skip-link visually-hidden-focusable" href="#main-content">{{ $t('skip_to_content') }}</a>
  <Loading />
  <Transition name="page" mode="out-in">
    <component :is="layout" :key="layoutName" />
  </Transition>
  <DemoBanner v-if="DEMO_MODE" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { DEMO_MODE } from '~/config.js'
import Loading from './Loading.vue'
import DemoBanner from './DemoBanner.vue'
import DefaultLayout from '~/layouts/default.vue'
import LandingLayout from '~/layouts/landing.vue'
import AuthLayout from '~/layouts/auth.vue'
import ErrorLayout from '~/layouts/error.vue'

const layouts = { default: DefaultLayout, landing: LandingLayout, auth: AuthLayout, error: ErrorLayout }

const route = useRoute()
const layoutName = computed(() => (layouts[route.meta.layout] ? route.meta.layout : 'default'))
const layout = computed(() => layouts[layoutName.value])
</script>
