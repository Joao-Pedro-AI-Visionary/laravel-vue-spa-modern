<template>
  <a class="skip-link visually-hidden-focusable" href="#main-content">{{ $t('skip_to_content') }}</a>
  <DemoBanner v-if="DEMO_MODE" />
  <Loading />
  <Transition name="page" mode="out-in">
    <component :is="layout" :key="layoutName" />
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { DEMO_MODE } from '~/config.js'
import Loading from './Loading.vue'
import DemoBanner from './DemoBanner.vue'
import DefaultLayout from '~/layouts/default.vue'
import BasicLayout from '~/layouts/basic.vue'
import ErrorLayout from '~/layouts/error.vue'

const layouts = { default: DefaultLayout, basic: BasicLayout, error: ErrorLayout }

const route = useRoute()
const layoutName = computed(() => (layouts[route.meta.layout] ? route.meta.layout : 'default'))
const layout = computed(() => layouts[layoutName.value])
</script>
