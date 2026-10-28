<template>
  <div class="row">
    <div class="col-lg-10 m-auto">
      <Card :title="$t('home')">
        <p class="m-0" data-testid="logged-in">{{ $t('you_are_logged_in') }}</p>
      </Card>
    </div>
  </div>
</template>
