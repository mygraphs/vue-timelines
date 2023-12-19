<template>
  <CalendarContext>
    <CellSizeContext>
      <MyTimeline :groups="groups" :tasks="tasks">
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
    tasks: {
      type: Object,
      default: () => {},
    },
    force_update: {
      type: Number,
      default: 1,
    }
  },
  methods: {
    emitBubbleTask: function (updatedTasks) {
      this.$emit("update", updatedTasks);
    },
  },
  provide: function () {
    return {
      emitBubbleTask: this.emitBubbleTask,
    };
  },
  components: {
    CellSizeContext,
    CalendarContext,
    MyTimeline,
  },
};
</script>
