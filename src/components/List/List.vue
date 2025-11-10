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
  color: var(--vt-list-text, #606060);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.list > * {
  display: flex;
  align-items: center;
  padding: 0 var(--vt-spacing-md, 0.8rem);
  border-right: 1px solid var(--vt-list-border, rgb(226, 226, 226));
  border-bottom: 1px solid var(--vt-list-border, rgb(226, 226, 226));
}
</style>
