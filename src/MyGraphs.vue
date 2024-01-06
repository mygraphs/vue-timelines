<template>
  <div class="MyGraph">
    <CalendarContext>
      <CellSizeContext>
        <MyTimeline :groups="groups" :tasks="tasks" height="100%">
          <slot />
        </MyTimeline>
      </CellSizeContext>
    </CalendarContext>
  </div>
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

<style>
.MyGraph {
  padding: 0;
  margin: 0;
}
</style>
