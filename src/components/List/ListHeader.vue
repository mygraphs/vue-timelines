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
  background-color: #fdfdfd;
}
</style>
