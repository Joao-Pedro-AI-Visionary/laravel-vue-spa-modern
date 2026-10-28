<template>
  <Card class="text-center">
    <h1 class="h3 mb-4">
      {{ $t('page_not_found') }}
    </h1>

    <div class="links">
      <RouterLink :to="{ name: 'welcome' }">
        {{ $t('go_home') }}
      </RouterLink>
    </div>
  </Card>
</template>
