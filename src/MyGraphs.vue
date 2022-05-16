<template>
  <CalendarContext>
    <CellSizeContext>
      <MyGantt :groups="groups">
        <slot />
      </MyGantt>
    </CellSizeContext>
  </CalendarContext>
</template>

<script>
import { CellSizeContext, CalendarContext } from "@/contexts";
import MyGantt from "./MyGantt";

export default {
  name: "MyGraphs",
  emits: ["update"],
  props: {
    groups: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    emitUpdatedTasks: function (updatedTasks) {
      this.$emit("update", updatedTasks);
    },
  },
  provide: function () {
    return {
      emitUpdatedTasks: this.emitUpdatedTasks,
    };
  },
  components: {
    CellSizeContext,
    CalendarContext,
    MyGantt,
  },
};
</script>
