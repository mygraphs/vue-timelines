<template>
  <div class="list">
    <slot />
  </div>
</template>

<script>
export default {
  name: "List",
  props: {
    width: {
      type: String,
      default: "500px",
    },
  },
};
</script>

<style>
.list {
  min-width: v-bind(width);
  color: #606060;
  margin-bottom: 17px;
  display: flex;
  flex-direction: column;
}

.list > * {
  padding: 0.8rem 0.5rem;
  border-right: 1px solid rgb(226, 226, 226);
  border-bottom: 1px solid rgb(226, 226, 226);
}
</style>
