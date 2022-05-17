<template>
  <div class="list__header">
    <slot />
  </div>
</template>

<script>
export default {
  name: "ListHeader",
};
</script>

<style scoped>
.list__header {
  color: #707070;
  background-color: #f8f9fc;
  padding-top: 2rem;
  padding-bottom: 0.8rem;
  color: #000000;
  position: sticky;
  top: 0;
}
</style>
