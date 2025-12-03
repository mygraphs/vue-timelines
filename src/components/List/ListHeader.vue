<template>
  <div class="list__header calendar_group_header">
    <slot />
  </div>
</template>

<script>
import {
  headerHeight,
} from "@/contexts/CellSizeContext";

export default {
  name: "ListHeader",
  inject: {
    headerHeight,
  }
}
</script>

<style scoped>
.calendar_group_header {
  min-height: v-bind('headerHeight + "px"');
}

.list__header {
  color: var(--vt-list-header-text, #707070);
  background-color: var(--vt-list-header-bg, #f8f9fc);
  padding-top: 0;
  padding-bottom: var(--vt-spacing-md, 0.8rem);
  position: sticky;
  top: 0;
}
</style>
