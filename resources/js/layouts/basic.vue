<template>
  <main id="main-content" class="basic-layout d-flex align-items-center justify-content-center m-0 bg-white" tabindex="-1">
    <Child />
  </main>
</template>

<style lang="scss">
.basic-layout {
  color: #555d61;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 4.5rem 1rem 2rem;
  font-weight: 300;
  position: relative;

  .links > a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: #555d61;
    padding: 0 1rem;
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.1rem;
    text-decoration: none;
    text-transform: uppercase;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
