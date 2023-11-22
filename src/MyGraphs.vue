<template>
  <CalendarContext>
    <CellSizeContext>
      <MyTimeline :groups="groups">
        <slot />
      </MyTimeline>
    </CellSizeContext>
  </CalendarContext>
</template>

<script>
import { CellSizeContext, CalendarContext } from "@/contexts";
import MyTimeline from "./MyTimeline";

export default {
  name: "MyGraphs",
  emits: ["update"],
  props: {
    groups: {
      type: Object,
      default: () => {},
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
    MyTimeline,
  },
};
</script>
