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
  color: #707070;
  background-color: #f8f9fc;
  padding-top: 2rem;
  padding-bottom: 0.8rem;
  color: #707070;
  position: sticky;
  top: 0;
}
</style>
